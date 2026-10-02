import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

// The session's mileage: when it began, and what it has cost as /cost totals it.
const startedAt = atom({ plugin: 'odometer', key: 'startedAt' } as const, 0)
const usd = atom({ plugin: 'odometer', key: 'usd' } as const, null as number | null)
const isHidden = atom({ plugin: 'odometer', key: 'isHidden' } as const, false)

function miles(ms: number): string {
  const m = Math.max(0, Math.floor(ms / 60000))
  return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`
}

function money(v: number | null): string {
  return v === null ? '' : `$${v.toFixed(2)}`
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'odometer', description: 'How long this session has run and what it has cost. /odometer hide or show.' })
    const u = await $.session.usage()
    await update($, startedAt, () => u.startedAt)
    await update($, usd, () => u.cost?.usd ?? null)
    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    if (e.cost) await update($, usd, () => e.cost?.usd ?? null)
    return next(e)
  })

  on('command.run', { command: 'odometer' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    if (arg === 'hide' || arg === 'show') {
      await update($, isHidden, () => arg === 'hide')
      return { text: arg === 'hide' ? 'Odometer hidden.' : 'Odometer showing.' }
    }
    const ran = (await $.clock.now()) - (await read($, startedAt))
    const cost = money(await read($, usd))
    return { text: `🧭 ${miles(ran)}${cost ? `  ${cost}` : ''}` }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const began = await read($, startedAt)
    if (e.props.hasSurvey || !began || (await read($, isHidden))) return next(e)
    const ran = miles((await $.clock.now()) - began)
    const cost = money(await read($, usd))

    const { Box, Text } = $.ui.resolve(e)
    // A small dial of our own; every other band above the prompt draws beside it.
    const below = await next(e)
    return (
      <Box flexDirection="row">
        <Box marginRight={3} flexDirection="row">
          <Text>🧭 </Text>
          <Text bold>{ran}</Text>
          {cost ? <Text dimColor>  {cost}</Text> : null}
        </Box>
        {below}
      </Box>
    )
  })
}
