import { expect, mock, test } from 'claude-code/testing'
import { BUDGET, MANAGED_DIRS, ZERO, chain, handBack, levels, parse, piece, rewrite, sha, verifyChain, walkDown } from '../hooks/register'

const PROJECT = 'C:/work/proj'
const PROJECT_FILE = `${PROJECT}/.claude/GLOVEBOX.md`
const RECEIPTS = '.claude/glovebox/receipts.log'

// A small disk in memory standing for the machine, with a session in PROJECT.
// The plugin writes fixed relative paths; in a session they land in the working
// directory, so here they are filed under PROJECT (the glovebox) or by name (its logs).
function world(on: any, files: Record<string, string> = {}, receiptsFail = false) {
  const disk = new Map<string, string>(Object.entries(files))
  const norm = (p: string) => p.replace(/\\/g, '/')
  const key = (p: string) => {
    const n = norm(p)
    if (disk.has(n)) return n
    if (n.endsWith('/.claude/glovebox/receipts.log')) return RECEIPTS
    if (n.endsWith('/.claude/glovebox/last-compact.md')) return '.claude/glovebox/last-compact.md'
    return n
  }
  on('fs.exists', (_: unknown, e: { path: string }) => ({ value: disk.has(key(e.path)) }))
  on('fs.read', (_: unknown, e: { path: string }) => ({ value: disk.get(key(e.path)) ?? '' }))
  on('fs.write', (_: unknown, e: { path: string; text: string }) => {
    let k = key(e.path)
    if (k.endsWith('/.claude/GLOVEBOX.md') && !k.startsWith(PROJECT)) k = PROJECT_FILE
    if (receiptsFail && k === RECEIPTS) throw new Error('disk full')
    disk.set(k, e.text)
    return { value: undefined }
  })
  on('session.cwd', () => ({ value: PROJECT }))
  on('session.turns', () => ({ value: 1 }))
  on('process.run', () => ({ value: { exitCode: 0, stdout: '', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }))
  on('prompt.compose', () => ({ sections: [{ id: 'intro', text: 'The engine prompt.', scope: 'shared' }] }))
  mock.clock(on)
  return disk
}

// The facts a request is composed from, given whole so the kit has an input.
const FACTS = { model: 'claude-test', promptModel: 'claude-test', surfaces: [], tools: [], outputStyle: null, traits: [] } as never

const SECTION = 'rostech-glovebox:standing'
const standingOf = (r: { sections: readonly { id: string; text: string }[] }) => r.sections.find(s => s.id === SECTION)?.text

// ─── Levels ───

test('the walk goes from the root down to the project', async () => {
  expect(walkDown('C:\\work\\proj')).toEqual(['C:/', 'C:/work', 'C:/work/proj'])
  expect(walkDown('/home/me/proj')).toEqual(['/', '/home', '/home/me', '/home/me/proj'])
})

test('levels run managed, then parents outer first, then the project', async () => {
  const ls = levels('C:\\work\\proj', MANAGED_DIRS)
  expect(ls.map(l => l.label)).toEqual(['managed', 'managed', 'managed', 'parent: C:/', 'parent: C:/work', 'project'])
  expect(ls[5].file).toBe('C:/work/proj/.claude/GLOVEBOX.md')
})

// ─── Notes ───

test('an empty glovebox says so', async ($, on) => {
  world(on)
  const shown = await $.command.run({ command: 'glovebox', args: '' })
  expect(shown.text).toContain('empty')
})

test('add, show, drop and clear in the project glovebox', async ($, on) => {
  const disk = world(on)
  await $.command.run({ command: 'glovebox', args: 'add the build command is `make quux`' })
  await $.command.run({ command: 'glovebox', args: 'add two' })
  expect(disk.get(PROJECT_FILE)).toContain('- the build command is `make quux`')
  const shown = await $.command.run({ command: 'glovebox', args: '' })
  expect(shown.text).toContain('project:')
  expect(shown.text).toContain('1. the build command is `make quux`')
  const dropped = await $.command.run({ command: 'glovebox', args: 'drop 1' })
  expect(dropped.text).toContain('Dropped entry 1')
  expect(disk.get(PROJECT_FILE)).not.toContain('make quux')
  const bad = await $.command.run({ command: 'glovebox', args: 'drop 9' })
  expect(bad.text).toContain('Pick 1 to 1')
  const cleared = await $.command.run({ command: 'glovebox', args: 'clear' })
  expect(cleared.text).toContain('cleared (1 entry)')
  expect(parse(disk.get(PROJECT_FILE) ?? '')).toEqual([])
})

test('a glovebox in a parent folder is read, shown read only, before the project', async ($, on) => {
  world(on, { 'C:/work/.claude/GLOVEBOX.md': '- tabs, never spaces\n' })
  await $.command.run({ command: 'glovebox', args: 'add project note' })
  const shown = (await $.command.run({ command: 'glovebox', args: '' })).text
  expect(shown).toContain('parent: C:/work (read only):')
  expect(shown.indexOf('parent: C:/work')).toBeLessThan(shown.indexOf('project:'))
})

test('a managed glovebox is read first and shown read only', async ($, on) => {
  world(on, { 'C:/Program Files/ClaudeCode/GLOVEBOX.md': '- [every-turn] never commit secrets\n' })
  await $.command.run({ command: 'glovebox', args: 'add project note' })
  const shown = (await $.command.run({ command: 'glovebox', args: '' })).text
  expect(shown).toContain('managed (read only):')
  expect(shown.indexOf('managed')).toBeLessThan(shown.indexOf('project:'))
  const text = standingOf(await $.prompt.compose(FACTS))
  expect(text).toContain('[managed] never commit secrets')
})

test('lines that are not entries stay as the person wrote them', async () => {
  const before = '# My rules\n\nA line I typed.\n\n- one\n'
  const after = rewrite(before, [{ kind: 'note', every: false, text: 'two' }])
  expect(after).toContain('A line I typed.')
  expect(parse(after)).toEqual([{ kind: 'note', every: false, text: 'two' }])
})

test('only /glovebox is answered; another command passes on unchanged', async ($, on) => {
  world(on)
  on('command.run', () => ({ text: 'the engine answered' }))
  const other = await $.command.run({ command: 'compact', args: '' })
  expect(other.text).toBe('the engine answered')
})

// ─── Files: a pointer, read fresh ───

test('add-file keeps a pointer and every turn reads the file fresh', async ($, on) => {
  const disk = world(on, { [`${PROJECT}/RULES.md`]: 'Rule one.\n' })
  const added = await $.command.run({ command: 'glovebox', args: 'add-file RULES.md --every-turn' })
  expect(added.text).toContain('read fresh each time. 1 lines.')
  expect(disk.get(PROJECT_FILE)).toContain('- [every-turn] [file] RULES.md')
  expect(standingOf(await $.prompt.compose(FACTS))).toContain('Rule one.')
  disk.set(`${PROJECT}/RULES.md`, 'Rule one, changed.\n')
  const after = standingOf(await $.prompt.compose(FACTS)) ?? ''
  expect(after).toContain('Rule one, changed.')
  expect(after).not.toContain('Rule one.\n')
})

test('a missing file says so instead of failing', async ($, on) => {
  world(on)
  const added = await $.command.run({ command: 'glovebox', args: 'add-file GONE.md --every-turn' })
  expect(added.text).toContain('missing right now')
  expect(standingOf(await $.prompt.compose(FACTS))).toContain('File GONE.md: missing')
  const shown = (await $.command.run({ command: 'glovebox', args: '' })).text
  expect(shown).toContain('📄 GONE.md · missing')
})

test('a file bigger than the budget warns and is still kept', async ($, on) => {
  const big = Array.from({ length: BUDGET + 50 }, (_, i) => `line ${i}`).join('\n')
  const disk = world(on, { [`${PROJECT}/BIG.md`]: big })
  const added = await $.command.run({ command: 'glovebox', args: 'add-file BIG.md' })
  expect(added.text).toContain(`alone is over the ${BUDGET}-line budget`)
  expect(disk.get(PROJECT_FILE)).toContain('- [file] BIG.md')
})

// ─── Every turn, and the receipts ───

test('only [every-turn] entries reach the system prompt, as a session section', async ($, on) => {
  world(on)
  await $.command.run({ command: 'glovebox', args: 'add after compaction only' })
  expect(standingOf(await $.prompt.compose(FACTS))).toBeUndefined()
  await $.command.run({ command: 'glovebox', args: 'add --every-turn answer in British English' })
  const composed = await $.prompt.compose(FACTS)
  const ours = composed.sections.find(s => s.id === SECTION)
  expect(ours?.scope).toBe('session')
  expect(ours?.text).toContain('Standing instructions from Glovebox')
  expect(ours?.text).toContain('[project] answer in British English')
  expect(ours?.text).not.toContain('after compaction only')
})

test('each turn writes one receipt per entry, in format v1', async ($, on) => {
  const disk = world(on)
  await $.command.run({ command: 'glovebox', args: 'add --every-turn answer in British English' })
  await $.prompt.compose(FACTS)
  await $.prompt.compose(FACTS) // a second request in the same turn writes no second receipt
  const log = (disk.get(RECEIPTS) ?? '').split('\n').filter(Boolean)
  expect(log.length).toBe(1)
  const r = JSON.parse(log[0])
  expect(Object.keys(r)).toEqual(['v', 't', 'trigger', 'level', 'entry', 'sha256', 'prev'])
  expect(r.v).toBe(1)
  expect(r.t).toMatch(/^\d{4}-\d\d-\d\dT/)
  expect(r.trigger).toBe('turn')
  expect(r.level).toBe('project')
  expect(r.entry).toBe('note:1')
  expect(r.sha256).toBe(await sha('[project] answer in British English'))
  expect(r.prev).toBe(ZERO)
  const shown = await $.command.run({ command: 'glovebox', args: 'receipts' })
  expect(shown.text).toContain('chain intact, 1 lines')
  expect(shown.text).toContain('note:1')
})

test('a file receipt names the path as written, and the next one chains onto it', async ($, on) => {
  const disk = world(on, { [`${PROJECT}/RULES.md`]: 'Rule one.\n' })
  await $.command.run({ command: 'glovebox', args: 'add-file RULES.md --every-turn' })
  await $.prompt.compose(FACTS)
  disk.set(`${PROJECT}/RULES.md`, 'Rule one, changed.\n') // same turn, new text: a new receipt
  await $.prompt.compose(FACTS)
  const text = disk.get(RECEIPTS) ?? ''
  const log = text.split('\n').filter(Boolean).map(l => JSON.parse(l))
  expect(log.map(r => r.entry)).toEqual(['RULES.md', 'RULES.md'])
  expect(log[0].sha256).not.toBe(log[1].sha256)
  expect((await verifyChain(text, null)).ok).toBe(true)
})

test('the log only grows: a long log is kept whole, never trimmed or rotated', async ($, on) => {
  const s = (i: number) => ({ level: 'project' as const, entry: `note:${i}`, sha256: 'ef'.repeat(32) })
  const old = (await chain(null, '2026-10-03T00:00:00.000Z', 'turn', Array.from({ length: 3000 }, (_, i) => s(i + 1)))).join('\n') + '\n'
  const disk = world(on, { [RECEIPTS]: old })
  await $.command.run({ command: 'glovebox', args: 'add --every-turn answer in British English' })
  await $.prompt.compose(FACTS)
  const now = disk.get(RECEIPTS) ?? ''
  expect(now.startsWith(old)).toBe(true)
  expect(now.split('\n').filter(Boolean).length).toBe(3001)
  expect((await verifyChain(now, null)).ok).toBe(true)
  expect([...disk.keys()].some(k => /receipts\.log\.\d/.test(k))).toBe(false)
})

test('the chain verifies, and a changed or removed line breaks it', async () => {
  const stamps = [1, 2, 3].map(i => ({ level: 'project' as const, entry: `note:${i}`, sha256: 'ab'.repeat(32) }))
  const lines = await chain(null, '2026-10-04T00:00:00.000Z', 'turn', stamps)
  const text = lines.join('\n') + '\n'
  expect(await verifyChain(text, null)).toEqual({ ok: true, lines: 3 })
  const tampered = [lines[0], lines[1].replace('note:2', 'note:9'), lines[2]].join('\n')
  expect(await verifyChain(tampered, null)).toEqual({ ok: false, lines: 3, brokenAt: 3 })
  const removed = [lines[0], lines[2]].join('\n')
  expect(await verifyChain(removed, null)).toEqual({ ok: false, lines: 2, brokenAt: 2 })
})

// ─── After a compaction (the kit has no conversation to compact; PROOF.md checks it live) ───

test('the hand-back carries the entries and the changed files', async () => {
  const level = levels('/p', [])[1]
  const note = piece({ kind: 'note', every: false, text: 'the build command is `make quux`', level, lines: 1 })
  const missing = piece({ kind: 'file', every: false, text: 'GONE.md', level, content: null, lines: 0 })
  const text = handBack([note, missing], ' M src/app.ts')
  expect(text).toContain('anchored state from before compaction')
  expect(text).toContain('[project] the build command is `make quux`')
  expect(text).toContain('File GONE.md: missing')
  expect(text).toContain('M src/app.ts')
  expect(handBack([], '')).toBe('')
})

test('a receipt that cannot be written never keeps the rules from Claude', async ($, on) => {
  world(on, {}, true)
  await $.command.run({ command: 'glovebox', args: 'add --every-turn answer in British English' })
  expect(standingOf(await $.prompt.compose(FACTS))).toContain('answer in British English')
})

// ─── His first try, 4 Oct 2026: /compact in a brand-new session threw ───
// "next() passed an argument with an empty messages (a compaction leaves at least one)".
test('a compaction with nothing to compact is skipped, never thrown', async ($, on) => {
  world(on)
  await $.command.run({ command: 'glovebox', args: 'add the build command is make quux' })
  const result = await $.session.compact({ trigger: 'manual', messages: [] } as any)
  expect(result.skip).toBe('Not enough messages to compact.')
})
