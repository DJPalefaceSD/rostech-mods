import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Pick, StatusReading } from '../types'

// The Dashboard: a button above the prompt that opens a panel. Every row DOES
// something. Effort and the helper model rewrite each request on its way out
// (turn.step), so nothing here is a picture of a setting. The launch buttons
// and the status row are the user's own, from /config.

const PANE = 'dashboard'
const ACCENT = '#E8833A'

const status = atom({ plugin: 'rostech-dashboard', key: 'status' } as const, null as StatusReading)
const effort = atom({ plugin: 'rostech-dashboard', key: 'effort' } as const, null as Pick)
const cheapHelpers = atom({ plugin: 'rostech-dashboard', key: 'cheapHelpers' } as const, false)
const lastSent = atom({ plugin: 'rostech-dashboard', key: 'lastSent' } as const, null as string | null)
const lastEffort = atom({ plugin: 'rostech-dashboard', key: 'lastEffort' } as const, null as string | null)
const isOpen = atom({ plugin: 'rostech-dashboard', key: 'isOpen' } as const, false)

const EFFORTS: { id: string; name: string }[] = [
  { id: 'low', name: 'Low' },
  { id: 'medium', name: 'Medium' },
  { id: 'high', name: 'High' },
  { id: 'xhigh', name: 'XHigh' },
  { id: 'max', name: 'Max' },
]
const HELPER_MODEL = 'claude-haiku-4-5-20251001'

export type Launch = { name: string; text: string }

// "Label=prompt; Label=prompt". A part with no = uses its words for both.
export function parseButtons(raw: unknown): Launch[] {
  return String(raw ?? '')
    .split(';')
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => {
      const at = part.indexOf('=')
      if (at < 0) return { name: part, text: part }
      const name = part.slice(0, at).trim()
      const text = part.slice(at + 1).trim()
      return { name: name || text, text: text || name }
    })
    .filter(one => one.text)
}

// A program and its arguments, split on spaces; "double" or 'single' quotes
// keep a part with spaces in it whole. No shell, so no pipes or globs.
export function parseCommand(raw: unknown): string[] {
  const out: string[] = []
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g
  const text = String(raw ?? '')
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) out.push(m[1] ?? m[2] ?? m[3] ?? '')
  return out
}

// "n of m" anywhere in the output wins; otherwise its first non-empty line.
export function readOutput(stdout: string): StatusReading {
  const hit = /(\d+) of (\d+)/.exec(stdout)
  const first = stdout.split(/\r?\n/).map(l => l.trim()).find(Boolean) ?? ''
  if (hit) return { count: { n: Number(hit[1]), of: Number(hit[2]) }, line: first }
  return first ? { count: null, line: first } : null
}

// claude-opus-5-5 → Opus 5.5; claude-haiku-4-5-20251001 → Haiku 4.5.
function modelName(id: string | null): string {
  if (!id) return '—'
  const parts = id.replace(/^claude-/, '').split('-').filter(p => !/^\d{8}$/.test(p))
  const words = parts.filter(p => !/^\d+$/.test(p))
  const nums = parts.filter(p => /^\d+$/.test(p))
  if (!words.length) return id
  const word = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  return nums.length ? `${word} ${nums.join('.')}` : word
}
function effortName(id: string | null): string {
  return EFFORTS.find(e => e.id === id)?.name ?? 'Auto'
}
function spaced(word: string): string {
  return word.split('').join(' ')
}
function clip(text: string, max: number): string {
  return text.length > max ? text.slice(0, Math.max(1, max - 1)) + '…' : text
}

// The status row, read by the user's own command at the moment of looking.
type StatusCommand = { argv: string[]; folder: string }
async function readStatus($: EngineInterface, cfg: StatusCommand) {
  if (!cfg.argv.length) return
  try {
    const run = await $.process.run(cfg.argv, { ...(cfg.folder ? { cwd: cfg.folder } : {}), timeoutMs: 20000 })
    // A failed command says why, never a silent "no reading yet".
    const err = run.stderr.trim().split(/\r?\n/)[0] ?? ''
    const said = readOutput(run.stdout) ?? (run.exitCode !== 0 ? { count: null, line: `failed (${run.exitCode}): ${err}` } : null)
    await update($, status, () => said)
  } catch (err) {
    await update($, status, () => ({ count: null, line: `could not run: ${String((err as Error)?.message ?? err)}` }))
  }
}

async function openPane($: EngineInterface, cfg: StatusCommand) {
  await $.ui.open({ id: PANE, title: 'Dashboard' })
  await update($, isOpen, () => true)
  await readStatus($, cfg)
}

export const register: Register = (on, options) => {
  const buttons = parseButtons(options.buttons)
  const argv = parseCommand(options.statusCommand)
  const folder = String(options.statusFolder ?? '').trim()
  const statusLabel = String(options.statusLabel ?? '').trim() || 'STATUS'

  const cfg: StatusCommand = { argv, folder }

  on('session.start', async ($, e, next) => {
    // Read the status as soon as the mod loads, not only when the panel opens.
    void readStatus($, cfg)
    await $.command.register({ name: 'dashboard', description: 'Open the Dashboard: effort, helper agents, your launch buttons and status row.' })
    return next(e)
  })

  // The real work: every request leaves with the picks on it.
  on('turn.step', async function* ($, e, next) {
    if (e.agentId) {
      if (await read($, cheapHelpers)) return yield* next({ ...e, model: HELPER_MODEL })
      return yield* next(e)
    }
    const ef = await read($, effort)
    const sent = { ...e, ...(ef ? { effort: ef as typeof e.effort } : {}) }
    await update($, lastSent, () => sent.model)
    await update($, lastEffort, () => (typeof sent.effort === 'string' ? sent.effort : null))
    return yield* next(sent)
  })

  // The reply carries the status reading too, for a surface that draws no pane.
  on('command.run', { command: 'dashboard' }, async $ => {
    await openPane($, cfg)
    if (!argv.length) return { text: 'Dashboard opened.' }
    const s = await read($, status)
    const shown = s === null ? 'no reading' : s.count ? `${s.count.n} of ${s.count.of}` : s.line
    return { text: `Dashboard opened. ${statusLabel}: ${shown}` }
  })

  on('turn.complete', async ($, e, next) => {
    if (await read($, isOpen)) await readStatus($, cfg)
    return next(e)
  })

  on('ui.close', { id: PANE }, async ($, e, next) => {
    await update($, isOpen, () => false)
    return next(e)
  })

  // The button. Yields to a survey; otherwise it sits beside whatever the
  // other plugins drew in the band, never over it.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)
    const { Box, Button } = $.ui.resolve(e)
    const up = await read($, isOpen)
    const below = await next(e)
    return (
      <Box flexDirection="row" justifyContent="space-between">
        <Box flexGrow={1}>{below}</Box>
        <Button
          key="dashboard"
          variant="primary"
          label={up ? '◆ Dashboard ▴' : '◆ Dashboard ▾'}
          onPress={async () => {
            if (await read($, isOpen)) {
              await $.ui.close({ id: PANE })
              await update($, isOpen, () => false)
            } else {
              await openPane($, cfg)
            }
          }}
        />
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const ef = await read($, effort)
    const s = await read($, status)
    const cheap = await read($, cheapHelpers)
    const sent = await read($, lastSent)
    const sentEffort = await read($, lastEffort)
    const width = Math.max(20, (e.props.bodyColumns ?? 80) - 12)

    // What the last message really went out with; the pick until one has gone.
    const shownModel = modelName(sent)
    const shownEffort = sentEffort ? effortName(sentEffort) : effortName(ef)
    const label = (text: string) => (
      <Box width={9}>
        <Text dimColor>{clip(text, 8)}</Text>
      </Box>
    )
    const heading = (text: string) => (
      <Box marginTop={1}>
        <Text dimColor bold>{spaced(text)}</Text>
      </Box>
    )

    return (
      <Box flexDirection="column" paddingX={1}>
        <Box justifyContent="space-between">
          <Text color={ACCENT} bold>◆ {spaced('DASHBOARD')}</Text>
          <Text dimColor>{shownModel} · {shownEffort}</Text>
        </Box>

        {argv.length ? (
          <Box key="status" marginTop={1}>
            {label(statusLabel)}
            {s === null ? <Text dimColor>no reading yet</Text> : s.count ? (
              <Text color={s.count.n === 0 ? 'green' : s.count.n >= s.count.of ? 'red' : 'yellow'} bold>
                {s.count.n} of {s.count.of}
              </Text>
            ) : (
              <Text>{clip(s.line, width)}</Text>
            )}
          </Box>
        ) : null}
        <Box marginTop={argv.length ? 0 : 1}>
          {label('EFFORT')}
          <Box flexWrap="wrap" columnGap={1}>
            <Button key="effort-auto" variant={ef === null ? 'primary' : undefined} dimColor={ef !== null} label="Auto"
              onPress={() => update($, effort, () => null)} />
            {EFFORTS.map(one => (
              <Button key={`effort-${one.id}`} variant={ef === one.id ? 'primary' : undefined} dimColor={ef !== one.id}
                label={one.name} onPress={() => update($, effort, () => one.id)} />
            ))}
          </Box>
        </Box>

        {heading('SETTINGS')}
        <Box justifyContent="space-between">
          <Text>
            <Text color={cheap ? 'green' : undefined}>{cheap ? '● ' : '○ '}</Text>
            <Text bold>Helper agents</Text>
            <Text dimColor>  the model they use</Text>
          </Text>
          <Button key="helpers" variant="primary" label={cheap ? 'Fast & Cheap' : 'Same as me'}
            onPress={() => update($, cheapHelpers, was => !was)} />
        </Box>

        {heading('LAUNCH')}
        {buttons.length ? (
          <Box columnGap={3} flexWrap="wrap">
            {buttons.map((one, i) => (
              <Button key={`launch-${i}`} label={`◆ ${one.name}`}
                onPress={() => $.prompt.submit({ text: one.text, asUser: true })} />
            ))}
          </Box>
        ) : (
          <Text key="launch-empty" dimColor>No buttons yet. Add them in /config, or ask Claude to.</Text>
        )}
      </Box>
    )
  })
}

