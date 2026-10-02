import type { Register } from 'claude-code'

// STUB. Loads, validates, and answers /turn-meter with what it will become.
// The shape it is heading for: turn.complete records; pane charts the last turns
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'turn-meter', description: "How long and how many tool calls each turn took, charted." })
    return next(e)
  })

  on('command.run', { command: 'turn-meter' }, async () => {
    return { text: 'Not built yet. ' + "How long and how many tool calls each turn took, charted." }
  })
}
