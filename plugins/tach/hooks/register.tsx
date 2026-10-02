import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'
import type { Burn } from '../types'

// Every turn's tokens this session, with when it ended. Only the last day is kept.
const burns = atom({ plugin: 'tach', key: 'burns' } as const, [] as Burn[])
// The clock as the band last read it, so the window slides even while idle.
const now = atom({ plugin: 'tach', key: 'now' } as const, 0)
// How far back the reading looks, in minutes. $.store keeps it across sessions.
const windowMin = atom({ plugin: 'tach', key: 'windowMin' } as const, 5)
// The busiest rate ever read, tokens a minute. The red zone is measured from it.
const peak = atom({ plugin: 'tach', key: 'peak' } as const, 0)
const isHidden = atom({ plugin: 'tach', key: 'isHidden' } as const, false)

const DAY = 24 * 60 * 60_000
const SEGMENTS = 10
// The top two segments are the red zone: 80% of your own busiest rate and up.
const REDLINE = 8

// Fresh tokens only: what the turn read new, wrote to the cache and generated.
// Cache reads are left out; they are cheap and would swamp the needle.
function tokensOf(u: { input_tokens: number; output_tokens: number; cache_creation_input_tokens: number }): number {
  return u.input_tokens + u.output_tokens + u.cache_creation_input_tokens
}

function rate(list: readonly Burn[], at: number, minutes: number): number {
  const from = at - minutes * 60_000
  const sum = list.filter(b => b.at > from && b.at <= at).reduce((t, b) => t + b.tokens, 0)
  return Math.round(sum / minutes)
}

function short(n: number): string {
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

function span(minutes: number): string {
  return minutes % 60 === 0 ? `${minutes / 60}h` : `${minutes}m`
}

// "5m", "90m", "1h", "2h" into minutes; anything else is null.
function parseSpan(text: string): number | null {
  const m = /^(\d+)\s*(m|min|h|hr)?$/i.exec(text.trim())
  if (!m) return null
  const n = Number(m[1]) * (m[2] && m[2].toLowerCase().startsWith('h') ? 60 : 1)
  return n >= 1 && n <= 24 * 60 ? n : null
}

// How many of the ten segments are lit for this rate.
function lit(r: number, top: number): number {
  return r <= 0 || top <= 0 ? 0 : Math.max(1, Math.min(SEGMENTS, Math.round((r / top) * SEGMENTS)))
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'tach', description: 'How fast you are burning tokens. /tach, /tach 15m or /tach 1h for the window, /tach hide or show.' })
    const keptWindow = await $.store.get('windowMin')
    if (typeof keptWindow === 'number') await update($, windowMin, () => keptWindow)
    const keptPeak = await $.store.get('peak')
    if (typeof keptPeak === 'number') await update($, peak, () => keptPeak)
    await update($, now, async () => await $.clock.now())
    // Every 15 seconds the window slides, so an idle tach falls back to zero.
    $.clock.every(15_000, async () => {
      await update($, now, async () => await $.clock.now())
    })
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    if (e.usage) {
      const at = await $.clock.now()
      const tokens = tokensOf(e.usage)
      const list = [...(await read($, burns)).filter(b => b.at > at - DAY), { at, tokens }]
      await update($, burns, () => list)
      await update($, now, () => at)
      const r = rate(list, at, await read($, windowMin))
      if (r > (await read($, peak))) {
        await update($, peak, () => r)
        await $.store.set('peak', r)
      }
    }
    return result
  })

  on('command.run', { command: 'tach' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    if (arg === 'hide' || arg === 'show') {
      await update($, isHidden, () => arg === 'hide')
      return { text: arg === 'hide' ? 'Tach hidden.' : 'Tach showing.' }
    }
    if (arg) {
      const minutes = parseSpan(arg)
      if (minutes === null) return { text: 'Give the window as minutes or hours: /tach 5m, /tach 30m, /tach 2h.' }
      await update($, windowMin, () => minutes)
      await $.store.set('windowMin', minutes)
      return { text: `Tach now reads the last ${span(minutes)}.` }
    }
    const at = await $.clock.now()
    const minutes = await read($, windowMin)
    const r = rate(await read($, burns), at, minutes)
    const top = await read($, peak)
    return { text: `⚙️ ${short(r)} tokens a minute over the last ${span(minutes)}.${top ? ` Your busiest: ${short(top)} a minute.` : ''}` }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || (await read($, isHidden))) return next(e)
    const list = await read($, burns)
    if (!list.length) return next(e)
    const minutes = await read($, windowMin)
    const r = rate(list, await read($, now), minutes)
    const glowing = lit(r, await read($, peak))

    const { Box, Text } = $.ui.resolve(e)
    // Green, then amber from the middle, then red in the top two segments.
    const segment = (i: number) => (i >= REDLINE ? 'red' : i >= SEGMENTS / 2 ? 'yellow' : 'green')
    const below = await next(e)
    return (
      <Box flexDirection="row">
        <Box marginRight={3} flexDirection="row" flexShrink={0}>
          <Text>⚙️ </Text>
          {Array.from({ length: SEGMENTS }, (_, i) =>
            i < glowing ? <Text key={i} color={segment(i)}>▮</Text> : <Text key={i} dimColor>▯</Text>
          )}
          <Text bold>  {short(r)}/min</Text>
          <Text dimColor>  {span(minutes)}</Text>
        </Box>
        {below}
      </Box>
    )
  })
}
