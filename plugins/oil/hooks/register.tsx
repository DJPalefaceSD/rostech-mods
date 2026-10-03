import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, SessionRateLimit, TurnUsage } from 'claude-code'

import type { Limit, Week } from '../types'

// His idea, 3 Oct 2026: "Oil - shows your Fable use similar to gas gauge".
//
// The engine reports the plan's windows (5-hour, week) but not what each model
// used. So Oil counts it: every model response, main thread and subagents alike,
// carries the model that answered and its tokens. Fable's tokens over everyone's,
// since the plan's week last refilled, is the oil level. If the plan ever reports
// a window of Fable's own, Oil reads that instead, the way Gas Gauge does.

const week = atom({ plugin: 'oil', key: 'week' } as const, { resetsAt: '', fable: 0, all: 0 } as Week)
const limit = atom({ plugin: 'oil', key: 'limit' } as const, null as Limit | null)
const isHidden = atom({ plugin: 'oil', key: 'isHidden' } as const, false)

const STORE_KEY = 'week'
const CELLS = 6

export function isFable(model: string): boolean {
  return model.toLowerCase().includes('fable')
}

// Cache reads are left out: they are the cheap re-read of a conversation, and on a
// long session they would drown out the work itself.
export function tokens(u: TurnUsage): number {
  return u.input_tokens + u.output_tokens + u.cache_creation_input_tokens
}

// The level, in percent: Fable's share of the week's work, or how much of
// Fable's own window is left when the plan reports one.
export function level(w: Week, l: Limit | null): number {
  if (l) return Math.max(0, Math.round(100 - l.percentUsed))
  return w.all > 0 ? Math.round((w.fable / w.all) * 100) : 0
}

export function size(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`
  return String(n)
}

function halves(pct: number): [string, string] {
  const full = Math.round((pct / 100) * CELLS)
  const cells = '█'.repeat(full) + '░'.repeat(CELLS - full)
  return [cells.slice(0, CELLS / 2), cells.slice(CELLS / 2)]
}

export function words(w: Week, l: Limit | null): string {
  if (l) return `Fable ${level(w, l)}% left`
  return `Fable ${size(w.fable)} tokens this week`
}

// A new week starts when the plan's week window moves to a later refill.
export function rollover(w: Week, resetsAt: string | undefined): Week {
  if (!resetsAt || resetsAt === w.resetsAt) return w
  if (w.resetsAt && new Date(resetsAt) <= new Date(w.resetsAt)) return w
  return { resetsAt, fable: w.resetsAt ? 0 : w.fable, all: w.resetsAt ? 0 : w.all }
}

function fableWindow(all: readonly SessionRateLimit[]): Limit | null {
  return all.find(t => isFable(t.kind)) ?? null
}

// Every session on this machine adds to the same week, kept in the store.
async function load($: EngineInterface): Promise<Week> {
  const kept = (await $.store.get(STORE_KEY)) as Week | undefined
  return kept && typeof kept.all === 'number' ? kept : { resetsAt: '', fable: 0, all: 0 }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'oil', description: "Show this week's Fable use. /oil hide or /oil show for the band." })
    const usage = await $.session.usage()
    await $.store.set('windows', usage.rateLimits)
    const seven = usage.rateLimits.find(t => t.kind === 'seven_day')
    const w = rollover(await load($), seven?.resetsAt)
    await $.store.set(STORE_KEY, w)
    await update($, week, () => w)
    await update($, limit, () => fableWindow(usage.rateLimits))
    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    // Every window the engine reports, kept as received, so a window by another name can be found.
    await $.store.set('windows', e.rateLimits)
    if (e.changed.includes('rateLimits')) {
      const seven = e.rateLimits.find(t => t.kind === 'seven_day')
      const w = rollover(await load($), seven?.resetsAt)
      await $.store.set(STORE_KEY, w)
      await update($, week, () => w)
      await update($, limit, () => fableWindow(e.rateLimits))
    }
    return next(e)
  })

  // Every model response, main thread and subagents, says which model answered.
  on('turn.step', async function* ($, e, next) {
    const r = yield* next(e)
    if (r.usage) {
      const used = tokens(r.usage)
      const kept = await load($)
      const w: Week = { ...kept, all: kept.all + used, fable: kept.fable + (isFable(r.usage.model) ? used : 0) }
      await $.store.set(STORE_KEY, w)
      await update($, week, () => w)
      if ((await read($, isHidden)) && w.fable > 0) $.ui.status(`🛢️ ${words(w, await read($, limit))}`)
    }
    return r
  })

  on('command.run', { command: 'oil' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    if (arg === 'hide' || arg === 'show') {
      await update($, isHidden, () => arg === 'hide')
      if (arg === 'show') $.ui.status(undefined)
      return { text: arg === 'hide' ? 'Band hidden. The status line keeps the number.' : 'Band showing.' }
    }
    const w = await read($, week)
    const l = await read($, limit)
    if (w.all === 0 && !l) return { text: 'No reading yet. The gauge fills after Claude answers once.' }
    return { text: `${words(w, l)}\nAll models this week: ${size(w.all)} tokens. Counted on this machine, cache reads left out.` }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || (await read($, isHidden))) return next(e)
    const w = await read($, week)
    const l = await read($, limit)
    if (w.fable === 0 && !l) return next(e)

    const { Box, Text } = $.ui.resolve(e)
    const below = await next(e)
    // His catch, 3 Oct: the share of the work read 82% while his Fable limit read 49%.
    // The engine sends mods the 5-hour and week windows only, never Fable's, so
    // without one Oil shows the count it can stand behind and no percent at all.
    if (!l) {
      return (
        <Box flexDirection="column">
          <Box flexDirection="row" flexWrap="wrap">
            <Text>🛢️ Fable  </Text>
            <Text color="magenta" bold>{size(w.fable)} tokens</Text>
            <Text dimColor> this week · your Fable limit is not shown to mods</Text>
          </Box>
          {below}
        </Box>
      )
    }
    const pct = level(w, l)
    const [low, high] = halves(pct)
    return (
      <Box flexDirection="column">
        <Box flexDirection="row" flexWrap="wrap">
          <Text>🛢️ Fable  </Text>
          <Text bold>L </Text>
          <Text color="magenta">{low}</Text>
          <Text bold> ½ </Text>
          <Text color="magenta">{high}</Text>
          <Text bold> H</Text>
          <Text color="magenta" bold>  {pct}% </Text>
          <Text dimColor>left</Text>
        </Box>
        {below}
      </Box>
    )
  })
}
