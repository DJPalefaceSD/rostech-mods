import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

// How full the context window is, 0 to 100, as the engine last measured it.
// null until the first response reports a fill.
const heat = atom({ plugin: 'context-limit', key: 'heat' } as const, null as number | null)
const isHidden = atom({ plugin: 'context-limit', key: 'isHidden' } as const, false)

// Gas Gauge's sibling, in a car's other dial: C .. ½ .. H.
const CELLS = 12
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
  return `C ${low} ½ ${high} H`
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'limit', description: 'Show how full the context window is. /limit hide or /limit show for the band.' })
    const usage = await $.session.usage()
    await update($, heat, () => usage.context.percent ?? null)
    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    if (e.changed.includes('context') && e.context.percent !== undefined) {
      const was = await read($, heat)
      const now = Math.round(e.context.percent)
      if (was !== null && was < HOT && now >= HOT) {
        $.ui.toast(`🌡️ Running hot: context is ${now}% full. /compact soon.`)
      }
      await update($, heat, () => now)
    }
    return next(e)
  })

  on('command.run', { command: 'limit' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    if (arg === 'hide' || arg === 'show') {
      await update($, isHidden, () => arg === 'hide')
      return { text: arg === 'hide' ? 'Band hidden.' : 'Band showing.' }
    }
    const now = await read($, heat)
    if (now === null) return { text: 'No reading yet. The gauge warms up after Claude answers once.' }
    return { text: `context  ${gauge(now)}  ${now}% full` }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || (await read($, isHidden))) return next(e)
    const now = await read($, heat)
    if (now === null) return next(e)

    const { Box, Text } = $.ui.resolve(e)
    const [low, high] = halves(now)
    return (
      <Box flexDirection="row">
        <Text bold>🌡️ CONTEXT LIMIT </Text>
        <Text>context  </Text>
        <Text bold>C </Text>
        <Text color={colour(now)}>{low}</Text>
        <Text bold> ½ </Text>
        <Text color={colour(now)}>{high}</Text>
        <Text bold> H</Text>
        <Text color={colour(now)} bold>  {now}% full</Text>
      </Box>
    )
  })
}
