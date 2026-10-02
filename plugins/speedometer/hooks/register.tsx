import { atom, read, update } from 'claude-code'
import type { Register, StateDollar } from 'claude-code'

// How full the context window is, 0 to 100, as the engine last measured it.
// null until the first response reports a fill.
const heat = atom({ plugin: 'speedometer', key: 'heat' } as const, null as number | null)
const isHidden = atom({ plugin: 'speedometer', key: 'isHidden' } as const, false)

// Gas Gauge's sibling, in a car's other dial: 0 .. ½ .. MAX.
const CELLS = 6
const HOT = 85

function colour(pct: number): string {
  return pct < 60 ? 'green' : pct < HOT ? 'yellow' : 'red'
}

function halves(pct: number): [string, string] {
  const full = Math.round((pct / 100) * CELLS)
  const cells = '█'.repeat(full) + '░'.repeat(CELLS - full)
  return [cells.slice(0, CELLS / 2), cells.slice(CELLS / 2)]
}

function gauge(pct: number): string {
  const [low, high] = halves(pct)
  return `0 ${low} ½ ${high} MAX`
}

// /speed and /speedometer give the same answer. Only $.state is touched here.
async function answer($: StateDollar, args: string) {
  const arg = args.trim().toLowerCase()
  if (arg === 'hide' || arg === 'show') {
    await update($, isHidden, () => arg === 'hide')
    return { text: arg === 'hide' ? 'Band hidden.' : 'Band showing.' }
  }
  const now = await read($, heat)
  if (now === null) return { text: 'No reading yet. The gauge warms up after Claude answers once.' }
  return { text: `${gauge(now)}  context ${now}% full` }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'speed', description: 'Show how full the context window is. /speed hide or /speed show for the band.' })
    await $.command.register({ name: 'speedometer', description: 'Same as /speed.' })
    const usage = await $.session.usage()
    await update($, heat, () => usage.context.percent ?? null)
    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    if (e.changed.includes('context') && e.context.percent !== undefined) {
      const was = await read($, heat)
      const now = Math.round(e.context.percent)
      if (was !== null && was < HOT && now >= HOT) {
        $.ui.toast(`🏎️ Redlining: context is ${now}% full. /compact soon.`)
      }
      await update($, heat, () => now)
    }
    return next(e)
  })

  on('command.run', { command: 'speed' }, async ($, e) => answer($, e.args))
  on('command.run', { command: 'speedometer' }, async ($, e) => answer($, e.args))

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || (await read($, isHidden))) return next(e)
    const now = await read($, heat)
    if (now === null) return next(e)

    const { Box, Text } = $.ui.resolve(e)
    const [low, high] = halves(now)
    // Just under half the band is ours, leaving the middle for a logo; every other band above the prompt draws in the rest.
    const half = Math.floor((e.props.bodyColumns ?? e.viewport?.columns ?? 80) * 0.45)
    const below = await next(e)
    return (
      <Box flexDirection="row">
        <Box width={half} flexDirection="column">
      <Box flexDirection="row">
        <Text bold>🏎️ </Text>
        <Text bold>0 </Text>
        <Text color={colour(now)}>{low}</Text>
        <Text bold> ½ </Text>
        <Text color={colour(now)}>{high}</Text>
        <Text bold> MAX</Text>
        <Text>  context </Text>
        <Text color={colour(now)} bold>{now}% full</Text>
      </Box>
        </Box>
        {below}
      </Box>
    )
  })
}
