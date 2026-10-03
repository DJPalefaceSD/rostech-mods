import { atom, read, update } from 'claude-code'
import type { Register, SessionRateLimit } from 'claude-code'

import type { Tanks } from '../types'

// The plan's windows, as the engine last measured them. Kept in $.state so a
// reload does not empty the tank.
const tanks = atom({ plugin: 'gas-gauge', key: 'tanks' } as const, [] as Tanks)
const isHidden = atom({ plugin: 'gas-gauge', key: 'isHidden' } as const, false)

// A warning fires once each time a tank drops past one of these, in percent left.
const WARN_AT = [25, 10]
const CELLS = 6

const NAMES: Record<string, string> = { five_hour: '5-hour', seven_day: 'week', spend_limit: 'spend' }

// The tanks setting, picked in /config: both windows, or one of them alone. A
// tank it leaves out is gone everywhere: the band, /gas, the toasts and the
// status line. Any other window the plan has, such as spend, always shows.
const LEFT_OUT: Record<string, string> = { '5-hour': 'seven_day', week: 'five_hour' }

function left(t: SessionRateLimit): number {
  return Math.max(0, Math.round(100 - t.percentUsed))
}

function name(t: SessionRateLimit): string {
  return NAMES[t.kind] ?? t.kind
}

function colour(pct: number): string {
  return pct >= 50 ? 'green' : pct >= 20 ? 'yellow' : 'red'
}

// A car's fuel gauge, his shape: E .. ½ .. F. Half the cells sit each side of
// the ½ mark, and the fill runs straight through it.
function halves(pct: number): [string, string] {
  const full = Math.round((pct / 100) * CELLS)
  const cells = '█'.repeat(full) + '░'.repeat(CELLS - full)
  return [cells.slice(0, CELLS / 2), cells.slice(CELLS / 2)]
}

function gauge(pct: number): string {
  const [low, high] = halves(pct)
  return `E ${low} ½ ${high} F`
}

// The refill, in the machine's own clock and words: a time today, a weekday
// and time later in the week.
function refill(t: SessionRateLimit): string {
  if (!t.resetsAt) return ''
  const at = new Date(t.resetsAt)
  if (isNaN(at.getTime())) return ''
  const time = at.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  const isToday = at.toDateString() === new Date().toDateString()
  return isToday ? time : `${at.toLocaleDateString([], { weekday: 'short' })} ${time}`
}

function line(t: SessionRateLimit): string {
  const r = refill(t)
  return `${name(t)}  ${gauge(left(t))}  ${left(t)}% left${r ? ` @ ${r}` : ''}`
}

export const register: Register = (on, options) => {
  const leftOut = LEFT_OUT[String(options.tanks ?? 'both')]
  const shown = (all: readonly SessionRateLimit[]) => all.filter(t => t.kind !== leftOut)

  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'gas', description: 'Show how much of your plan is left. /gas hide or /gas show for the band.' })
    const usage = await $.session.usage()
    await update($, tanks, () => shown(usage.rateLimits))
    return next(e)
  })

  // Pushed by the engine after each turn and whenever a window moves a point.
  on('session.measure', async ($, e, next) => {
    if (e.changed.includes('rateLimits')) {
      const measured = shown(e.rateLimits)
      const before = await read($, tanks)
      for (const t of measured) {
        const was = before.find(b => b.kind === t.kind)
        if (!was) continue
        for (const mark of WARN_AT) {
          if (left(was) > mark && left(t) <= mark) {
            $.ui.toast(`⛽ ${name(t)} tank is down to ${left(t)}%`)
          }
        }
      }
      await update($, tanks, () => measured)
      const isBandHidden = await read($, isHidden)
      $.ui.status(isBandHidden && measured.length ? '⛽ ' + measured.map(t => `${name(t)} ${left(t)}%`).join(' · ') : undefined)
    }
    return next(e)
  })

  on('command.run', { command: 'gas' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    if (arg === 'hide' || arg === 'show') {
      await update($, isHidden, () => arg === 'hide')
      return { text: arg === 'hide' ? 'Band hidden. The status line keeps the numbers.' : 'Band showing.' }
    }
    const now = await read($, tanks)
    if (!now.length) return { text: 'No reading yet. The gauge fills after Claude answers once, on a Claude plan.' }
    return { text: now.map(line).join('\n') }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || (await read($, isHidden))) return next(e)
    const now = await read($, tanks)
    if (!now.length) return next(e)

    const { Box, Text } = $.ui.resolve(e)
    // Half the band is ours; every other band above the prompt draws in the rest.
    const half = Math.floor((e.props.bodyColumns ?? e.viewport?.columns ?? 80) / 2)
    const below = await next(e)
    return (
      <Box flexDirection="row">
        <Box width={half} flexDirection="column">
        <Box flexDirection="row" flexWrap="wrap">
          <Text>⛽ </Text>
          {now.map(t => {
            const pct = left(t)
            const r = refill(t)
            const [low, high] = halves(pct)
            return (
              <Box key={t.kind} flexDirection="row" marginRight={2}>
                <Text>{name(t)}  </Text>
                <Text bold>E </Text>
                <Text color={colour(pct)}>{low}</Text>
                <Text bold> ½ </Text>
                <Text color={colour(pct)}>{high}</Text>
                <Text bold> F</Text>
                <Text color={colour(pct)} bold>  {pct}% </Text>
                {r ? <Text dimColor>@ {r}</Text> : null}
              </Box>
            )
          })}
        </Box>
        </Box>
        {below}
      </Box>
    )
  })
}
