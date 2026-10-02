import type { Register } from 'claude-code'

// STUB. Loads, validates, and answers /odometer with what it will become.
// The shape it is heading for: status line from $.session.usage(): startedAt and cost.usd; /odometer
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'odometer', description: "How long this session has run and what it has cost, on the dash." })
    return next(e)
  })

  on('command.run', { command: 'odometer' }, async () => {
    return { text: 'Not built yet. ' + "How long this session has run and what it has cost, on the dash." }
  })
}
