import type { Register } from 'claude-code'

// STUB. Loads, validates, and answers /valet-mode with what it will become.
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'valet-mode', description: "A safe, locked-down mode for someone else at your PC." })
    return next(e)
  })

  on('command.run', { command: 'valet-mode' }, async () => {
    return { text: 'Not built yet. ' + "A safe, locked-down mode for someone else at your PC." }
  })
}
