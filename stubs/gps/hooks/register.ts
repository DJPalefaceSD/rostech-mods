import type { Register } from 'claude-code'

// STUB. Loads, validates, and answers /gps with what it will become.
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'gps', description: "Where you are in a long job, and how much is left." })
    return next(e)
  })

  on('command.run', { command: 'gps' }, async () => {
    return { text: 'Not built yet. ' + "Where you are in a long job, and how much is left." }
  })
}
