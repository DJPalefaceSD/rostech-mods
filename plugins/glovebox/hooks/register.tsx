import type { EngineInterface, Register } from 'claude-code'

// Glovebox: short text notes, and pointers to files, that Claude gets back after it
// compacts its memory, or on every turn. Text only. It reads files on this machine,
// writes three files of its own in the project, and sends nothing to any network.

// 🏷️ THE NAME. The plugin's id is `rostech-glovebox` (plugin.json, the types key, the
// state refs and the section id below); the title and the command are Glovebox.
// Every write path and every state ref is written out as fixed text where it is used,
// so the directory can read it: a rename touches those lines too.
export const TITLE = 'Glovebox'
export const COMMAND = 'glovebox'
export const FILENAME = 'GLOVEBOX.md'
const ICON = '🧤'

// The project's own glovebox, its snapshot and its receipts. Writes spell these out.
export const FILE = '.claude/GLOVEBOX.md'
export const SNAPSHOT = '.claude/glovebox/last-compact.md'
export const RECEIPTS = '.claude/glovebox/receipts.log'

// The budget, in lines, across every level. A file counts by its size at the moment.
// 200 lines fits a rules file the size of a long style guide (196 lines, 8.5 KB) on its own.
export const BUDGET = 200
// How many changed files the snapshot keeps.
export const SNAPSHOT_CAP = 30

// The managed-policy folders Claude Code documents for its own CLAUDE.md and
// managed-settings.json. A GLOVEBOX.md placed there by an organisation is read first.
export const MANAGED_DIRS = ['C:/Program Files/ClaudeCode', '/Library/Application Support/ClaudeCode', '/etc/claude-code']

// ─── Levels: managed, then each folder above the project, then the project ───

export type LevelKind = 'managed' | 'parent' | 'project'
export type Level = { kind: LevelKind; label: string; dir: string; file: string }

export function norm(p: string): string {
  const s = p.replace(/\\/g, '/')
  return s.length > 1 && s.endsWith('/') && !/^[A-Za-z]:\/$/.test(s) ? s.slice(0, -1) : s
}

export function join(a: string, b: string): string {
  return a.endsWith('/') ? a + b : `${a}/${b}`
}

export function isAbsolute(p: string): boolean {
  return /^[A-Za-z]:[\\/]/.test(p) || p.startsWith('/') || p.startsWith('\\')
}

// Every folder from the filesystem's root down to `dir`, outermost first.
export function walkDown(dir: string): string[] {
  const d = norm(dir)
  const drive = /^([A-Za-z]:)(\/|$)/.exec(d)
  const root = drive ? `${drive[1]}/` : '/'
  const rest = d.slice(drive ? drive[1].length : 0).split('/').filter(Boolean)
  const out = [root]
  let at = root
  for (const part of rest) { at = join(at, part); out.push(at) }
  return out
}

// The levels in the order they reach Claude: outer first, the project last.
export function levels(cwd: string, managedDirs: readonly string[]): Level[] {
  const out: Level[] = []
  const seen = new Set<string>()
  const add = (kind: LevelKind, label: string, dir: string, file: string) => {
    const key = norm(file).toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    out.push({ kind, label, dir: norm(dir), file: norm(file) })
  }
  for (const m of managedDirs) add('managed', 'managed', m, join(m, FILENAME))
  const chain = walkDown(cwd)
  for (const dir of chain.slice(0, -1)) add('parent', `parent: ${dir}`, dir, join(dir, FILE))
  add('project', 'project', cwd, join(norm(cwd), FILE))
  return out
}

// ─── Entries: one line each in a GLOVEBOX.md ───

export type Entry = { kind: 'note' | 'file'; every: boolean; text: string }

export function parseLine(line: string): Entry | null {
  if (!line.startsWith('- ')) return null
  let rest = line.slice(2).trim()
  let every = false
  let isFile = false
  for (;;) {
    const tag = /^\[(every-turn|file)\]\s*/.exec(rest)
    if (!tag) break
    if (tag[1] === 'every-turn') every = true
    else isFile = true
    rest = rest.slice(tag[0].length)
  }
  return rest ? { kind: isFile ? 'file' : 'note', every, text: rest } : null
}

export function parse(text: string): Entry[] {
  return text.split(/\r?\n/).map(parseLine).filter((e): e is Entry => e !== null)
}

export function entryLine(e: Entry): string {
  return `- ${e.every ? '[every-turn] ' : ''}${e.kind === 'file' ? '[file] ' : ''}${e.text}`
}

const HEADER = `# ${TITLE}\n\nNotes and files Claude gets back after it compacts its memory. Lines marked [every-turn] reach it on every turn.\nEdit with /${COMMAND}. Lines that are not entries are kept as they are.\n`

// Rewrites only the entry lines; every other line in the file stays as the person wrote it.
export function rewrite(existing: string, entries: readonly Entry[]): string {
  const kept = existing ? existing.split(/\r?\n/).filter(l => parseLine(l) === null) : HEADER.split('\n')
  while (kept.length && kept[kept.length - 1].trim() === '') kept.pop()
  return [...kept, '', ...entries.map(entryLine)].join('\n') + '\n'
}

// ─── Reading what is in the glovebox, fresh from disk ───

export type Loaded = Entry & { level: Level; path?: string; content?: string | null; lines: number }

export function countLines(text: string): number {
  const t = text.replace(/\r?\n$/, '')
  return t ? t.split(/\r?\n/).length : 0
}

async function readText($: EngineInterface, path: string): Promise<string | null> {
  try {
    if (!(await $.fs.exists(path))) return null
    const text = await $.fs.read(path)
    return typeof text === 'string' ? text : null
  } catch {
    return null
  }
}

async function gather($: EngineInterface): Promise<Loaded[]> {
  const out: Loaded[] = []
  const cwd = await $.session.cwd()
  for (const level of levels(cwd, MANAGED_DIRS)) {
    const text = await readText($, level.file)
    if (!text) continue
    for (const e of parse(text)) {
      if (e.kind === 'note') { out.push({ ...e, level, lines: 1 }); continue }
      const path = isAbsolute(e.text) ? norm(e.text) : join(level.dir, e.text)
      const content = await readText($, path)
      out.push({ ...e, level, path, content, lines: content === null ? 0 : countLines(content) })
    }
  }
  return out
}

// ─── What Claude reads ───

// One entry as Claude reads it. The receipt hashes exactly this text.
export function piece(e: Loaded): string {
  const where = `[${e.level.label}]`
  if (e.kind === 'note') return `${where} ${e.text}`
  if (e.content === null || e.content === undefined) return `${where} File ${e.text}: missing, it could not be read just now.`
  return `${where} File ${e.text}:\n${e.content.replace(/\s+$/, '')}`
}

export function standing(pieces: readonly string[]): string {
  return (
    `Standing instructions from ${TITLE}. The person keeps these in front of you on every turn, outer levels first. ` +
    `They stay in force until the person changes them.\n\n` +
    pieces.join('\n\n')
  )
}

export function handBack(pieces: readonly string[], changed: string): string {
  const parts: string[] = []
  if (pieces.length) {
    parts.push(
      `${TITLE}: anchored state from before compaction. The person kept these with /${COMMAND}, outer levels first. ` +
        `Treat them as still true unless they are replaced:\n\n` +
        pieces.join('\n\n'),
    )
  }
  if (changed.trim()) parts.push(`Files changed when the conversation was compacted (git status --short):\n${changed.trim()}`)
  return parts.join('\n\n')
}

// ─── Receipts: proof of what was put in front of Claude, and when ───

// Receipt format v1, one JSON object per line (JSON Lines):
// {"v":1,"t":ISO time,"trigger":"turn"|"compact","level":"managed"|"user"|"ancestor"|"project",
//  "entry":"<path as written>" or "note:<n>","sha256":hex of the exact text injected for that entry,
//  "prev":hex sha256 of the previous receipt line as written, or 64 zeros for the very first}
// The prev chain makes the log tamper-evident. The free Glovebox keeps one file and only
// ever appends to it: never trimmed, never rotated.

export const ZERO = '0'.repeat(64)

export async function sha(text: string): Promise<string> {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))
  return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('')
}

export type Trigger = 'turn' | 'compact'
export type ReceiptLevel = 'managed' | 'user' | 'ancestor' | 'project'
export type Receipt = { v: 1; t: string; trigger: Trigger; level: ReceiptLevel; entry: string; sha256: string; prev: string }
export type Stamp = { level: ReceiptLevel; entry: string; sha256: string }

export function receiptLevel(kind: LevelKind): ReceiptLevel {
  return kind === 'parent' ? 'ancestor' : kind
}

// The chained lines for a batch, continuing from the line before them (null: the very first).
export async function chain(prevLine: string | null, t: string, trigger: Trigger, stamps: readonly Stamp[]): Promise<string[]> {
  const out: string[] = []
  let before = prevLine
  for (const s of stamps) {
    const r: Receipt = { v: 1, t, trigger, level: s.level, entry: s.entry, sha256: s.sha256, prev: before === null ? ZERO : await sha(before) }
    const line = JSON.stringify(r)
    out.push(line)
    before = line
  }
  return out
}

// Checks a log's chain. `prevLine` is the line before the first, or null.
export async function verifyChain(text: string, prevLine: string | null): Promise<{ ok: boolean; lines: number; brokenAt?: number }> {
  const lines = text.split(/\r?\n/).filter(Boolean)
  let before = prevLine
  for (let i = 0; i < lines.length; i++) {
    let prev = ''
    try { prev = String((JSON.parse(lines[i]) as Receipt).prev) } catch { return { ok: false, lines: lines.length, brokenAt: i + 1 } }
    if (prev !== (before === null ? ZERO : await sha(before))) return { ok: false, lines: lines.length, brokenAt: i + 1 }
    before = lines[i]
  }
  return { ok: true, lines: lines.length }
}

export function lastLine(text: string | null): string | null {
  const lines = (text ?? '').split(/\r?\n/).filter(Boolean)
  return lines.length ? lines[lines.length - 1] : null
}

// Appends the batch's receipts. The whole file is read and written back with the new
// lines on the end; nothing before them is changed or dropped.
async function writeReceipts($: EngineInterface, trigger: Trigger, stamps: readonly Stamp[]): Promise<void> {
  if (!stamps.length) return
  const t = new Date(await $.clock.now().catch(() => Date.now())).toISOString()
  const current = (await readText($, RECEIPTS)) ?? ''
  const lines = current.split(/\r?\n/).filter(Boolean)
  const added = await chain(lastLine(current), t, trigger, stamps)
  await $.fs.write('.claude/glovebox/receipts.log', [...lines, ...added].join('\n') + '\n')
}

// One stamp per entry: files by their path as written, notes by their number in their level.
async function stampsOf(entries: readonly Loaded[], pieces: readonly string[]): Promise<Stamp[]> {
  const out: Stamp[] = []
  const notes = new Map<string, number>()
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i]
    let entry = e.text
    if (e.kind === 'note') {
      const n = (notes.get(e.level.file) ?? 0) + 1
      notes.set(e.level.file, n)
      entry = `note:${n}`
    }
    out.push({ level: receiptLevel(e.level.kind), entry, sha256: await sha(pieces[i]) })
  }
  return out
}

// ─── The band's numbers ───

export function tokensOf(text: string): number {
  return Math.ceil(text.length / 4)
}

async function refresh($: EngineInterface, all: readonly Loaded[]): Promise<void> {
  const every = all.filter(e => e.every)
  await $.state.set({ plugin: 'rostech-glovebox', key: 'lines' }, all.reduce((a, e) => a + e.lines, 0))
  await $.state.set({ plugin: 'rostech-glovebox', key: 'everyLines' }, every.reduce((a, e) => a + e.lines, 0))
  await $.state.set({ plugin: 'rostech-glovebox', key: 'everyTokens' }, every.length ? tokensOf(standing(every.map(piece))) : 0)
}

function overNote(total: number): string {
  return total > BUDGET ? ` ⚠️ The glovebox is ${total} lines, over its ${BUDGET}-line budget: Claude may skim it.` : ''
}

// ─── The command ───

type Flags = { every: boolean; words: string[] }

export function flags(args: string): Flags {
  const words: string[] = []
  let every = false
  for (const w of args.trim().split(/\s+/).filter(Boolean)) {
    if (w === '--every-turn') every = true
    else words.push(w)
  }
  return { every, words }
}

function describe(e: Loaded, n: number): string {
  const turn = e.every ? '🔁 ' : ''
  if (e.kind === 'note') return `${n}. ${turn}${e.text}`
  const size = e.content === null ? 'missing' : `${e.lines} lines`
  return `${n}. ${turn}📄 ${e.text} · ${size}`
}

function show(all: readonly Loaded[]): string {
  if (!all.length) return `The ${TITLE.toLowerCase()} is empty. /${COMMAND} add <note> keeps one; /${COMMAND} add-file <path> keeps a file.`
  const total = all.reduce((a, e) => a + e.lines, 0)
  const every = all.filter(e => e.every)
  const out = [`${ICON} ${TITLE} · ${total} of ${BUDGET} lines${every.length ? ` · 🔁 every turn: ${every.reduce((a, e) => a + e.lines, 0)} lines` : ''}`]
  let label = ''
  let n = 0
  for (const e of all) {
    if (e.level.label !== label) {
      label = e.level.label
      n = 0
      out.push('', `${label}${e.level.kind === 'project' ? '' : ' (read only)'}:`)
    }
    out.push(describe(e, ++n))
  }
  return out.join('\n') + overNote(total)
}

async function receiptsText($: EngineInterface, rest: string): Promise<string> {
  const n = Math.max(1, Math.min(200, Number(rest) || 10))
  const text = (await readText($, RECEIPTS)) ?? ''
  const log = text.split(/\r?\n/).filter(Boolean)
  if (!log.length) return 'No receipts yet. One is written each time the glovebox reaches Claude.'
  const check = await verifyChain(text, null)
  const rows = log.slice(-n).map(l => {
    try {
      const r = JSON.parse(l) as Receipt
      return `${r.t}  ${r.trigger.padEnd(7)}  ${r.level.padEnd(8)}  ${r.entry}  ${r.sha256.slice(0, 12)}`
    } catch {
      return `(unreadable) ${l.slice(0, 60)}`
    }
  })
  const verdict = check.ok ? `chain intact, ${check.lines} lines` : `⚠️ chain broken at line ${check.brokenAt}: a line was changed or removed`
  return `${ICON} The last ${rows.length} receipts (${RECEIPTS}, ${verdict}):\n` + rows.join('\n')
}

// The project glovebox, the one /glovebox changes. A failed write is raised as a
// SaveError so the command can say where and why, instead of the hook throwing.
class SaveError extends Error {}
async function writeGlovebox($: EngineInterface, text: string): Promise<void> {
  try {
    await $.fs.write('.claude/GLOVEBOX.md', text)
  } catch (err) {
    const why = err instanceof Error ? err.message : String(err)
    const code = /\b(E[A-Z]{2,})\b/.exec(why)?.[1]
    throw new SaveError(`${join(norm(await $.session.cwd()), FILE)}${code ? ` (${code})` : ''}`)
  }
}

async function answer($: EngineInterface, args: string): Promise<string> {
  const { every, words } = flags(args)
  const verb = (words[0] ?? '').toLowerCase()
  const rest = words.slice(1).join(' ').trim()

  if (verb === '' || verb === 'show') {
    const all = await gather($)
    await refresh($, all)
    return show(all)
  }
  if (verb === 'receipts') return receiptsText($, rest)

  // Read where gather() reads the project level; written back as fixed text, relative
  // to the working directory, which is the session's.
  const existing = (await readText($, join(norm(await $.session.cwd()), FILE))) ?? ''
  const entries = parse(existing)

  if (verb === 'add' || verb === 'add-file') {
    if (!rest) return verb === 'add' ? `Nothing to add. /${COMMAND} add <note>` : `No file named. /${COMMAND} add-file <path>`
    const entry: Entry = { kind: verb === 'add-file' ? 'file' : 'note', every, text: rest.replace(/\s+/g, ' ') }
    await writeGlovebox($, rewrite(existing, [...entries, entry]))
    const all = await gather($)
    await refresh($, all)
    const total = all.reduce((a, x) => a + x.lines, 0)
    const turn = every ? ' 🔁 Every turn.' : ''
    if (entry.kind === 'note') return `${ICON} Kept in the glovebox: ${entry.text}.${turn}${overNote(total)}`
    const added = all.find(x => x.kind === 'file' && x.text === entry.text && x.level.kind === 'project')
    const size = !added || added.content === null ? ' ⚠️ It is missing right now; it will be read again each time.' : ` ${added.lines} lines.`
    const alone = added && added.lines > BUDGET ? ` ⚠️ This file alone is over the ${BUDGET}-line budget.` : ''
    return `${ICON} 📄 ${entry.text} is in the glovebox, read fresh each time.${size}${turn}${alone}${overNote(total)}`
  }

  if (verb === 'drop') {
    const n = Number(rest)
    if (!Number.isInteger(n) || n < 1 || n > entries.length) {
      return entries.length ? `No entry ${rest}. Pick 1 to ${entries.length}.` : 'The glovebox is empty.'
    }
    const gone = entries[n - 1]
    await writeGlovebox($, rewrite(existing, entries.filter((_, i) => i !== n - 1)))
    await refresh($, await gather($))
    return `${ICON} Dropped entry ${n}: ${gone.kind === 'file' ? '📄 ' : ''}${gone.text}`
  }

  if (verb === 'clear') {
    await writeGlovebox($, rewrite(existing, []))
    await refresh($, await gather($))
    return `${ICON} The glovebox is cleared (${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}).`
  }

  return `Try /${COMMAND}, add <note>, add-file <path>, drop <n>, clear, or receipts. Add --every-turn to send an entry every turn.`
}

// Before a compaction: the changed files, from `git status --short`, capped.
async function changedFiles($: EngineInterface): Promise<string> {
  const git = await $.process.run(['git', 'status', '--short'], { timeoutMs: 5000 }).catch(() => null)
  if (!git || git.exitCode !== 0) return ''
  const all = git.stdout.split(/\r?\n/).filter(Boolean)
  return all.slice(0, SNAPSHOT_CAP).join('\n') + (all.length > SNAPSHOT_CAP ? `\n… and ${all.length - SNAPSHOT_CAP} more` : '')
}

async function writeSnapshot($: EngineInterface, changed: string): Promise<void> {
  await $.fs.write('.claude/glovebox/last-compact.md', `# ${TITLE}: files changed at the last compaction\n\n${changed}\n`)
}

// Every turn: the [every-turn] entries, as one system-prompt section, with their receipts.
// A receipt that cannot be written never keeps the rules from Claude.
let turnLogged = -1
const loggedThisTurn = new Set<string>()

async function everyTurn($: EngineInterface): Promise<string | null> {
  const all = await gather($)
  await refresh($, all)
  const every = all.filter(x => x.every)
  if (!every.length) return null
  const pieces = every.map(piece)
  const turn = await $.session.turns()
  if (turn !== turnLogged) { turnLogged = turn; loggedThisTurn.clear() }
  const fresh = (await stampsOf(every, pieces)).filter(s => !loggedThisTurn.has(`${s.level}|${s.entry}|${s.sha256}`))
  fresh.forEach(s => loggedThisTurn.add(`${s.level}|${s.entry}|${s.sha256}`))
  await writeReceipts($, 'turn', fresh).catch(() => undefined)
  return standing(pieces)
}

// After a compaction: the other entries and the changed files, as one message.
async function afterCompact($: EngineInterface, changed: string): Promise<string> {
  const kept = (await gather($)).filter(x => !x.every)
  const pieces = kept.map(piece)
  const text = handBack(pieces, changed)
  if (text) await writeReceipts($, 'compact', await stampsOf(kept, pieces)).catch(() => undefined)
  return text
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'glovebox',
      description: 'Keep notes and files Claude gets back after it compacts. /glovebox add <note> · add-file <path> · --every-turn · drop <n> · clear · receipts',
    })
    await refresh($, await gather($))
    return next(e)
  })

  // Only /glovebox is answered here; any other command passes on unchanged.
  on('command.run', { command: 'glovebox' }, async ($, e, next) => {
    if (e.command !== 'glovebox') return next(e)
    try {
      return { text: await answer($, e.args) }
    } catch (err) {
      if (!(err instanceof SaveError)) throw err
      return { text: `${ICON} Nothing changed: the glovebox could not be saved to ${err.message}. Start Claude Code in your project folder and try again.` }
    }
  })

  on('prompt.compose', async ($, e, next) => {
    const composed = await next(e)
    const text = await everyTurn($)
    if (text === null) return composed
    return { sections: [...composed.sections, { id: 'rostech-glovebox:standing', text, scope: 'session' as const }] }
  })

  on('session.compact', async ($, e, next) => {
    // A compaction computed ahead of time is replayed by the real one, which comes
    // through here again; the entries are added then, so they are the newest.
    // A subagent's own compaction is left alone.
    if (e.trigger === 'precompute' || e.agentId) return next(e)
    // A conversation with nothing in it has nothing to compact, and the engine
    // refuses a next() handed an empty transcript. Say so, the way core does.
    if (e.messages.length === 0) return { skip: 'Not enough messages to compact.' }
    const changed = await changedFiles($)
    if (changed) await writeSnapshot($, changed)
    const result = await next(e)
    if (result.skip !== undefined) return result
    const text = await afterCompact($, changed)
    if (!text) return result
    return { ...result, messages: [...result.messages, { role: 'user' as const, text, toolUses: [] }] }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const { value: n = 0 } = await $.state.get({ plugin: 'rostech-glovebox', key: 'lines' })
    if (e.props.hasSurvey || n === 0) return next(e)
    const { value: perTurn = 0 } = await $.state.get({ plugin: 'rostech-glovebox', key: 'everyLines' })
    const { value: perTurnTokens = 0 } = await $.state.get({ plugin: 'rostech-glovebox', key: 'everyTokens' })
    const { Box, Text } = $.ui.resolve(e)
    const below = await next(e)
    const isOver = n > BUDGET
    const every = perTurn > 0 ? ` · 🔁 every turn ${perTurn} lines ≈${perTurnTokens} tokens` : ''
    return (
      <Box flexDirection="column">
        <Box flexDirection="row">
          <Text color={isOver ? 'red' : 'cyan'} bold>{`${ICON} ${TITLE} `}</Text>
          <Text color={isOver ? 'red' : undefined}>{`${n}/${BUDGET} lines${isOver ? ' · over budget' : ''}${every}`}</Text>
        </Box>
        {below}
      </Box>
    )
  })
}
