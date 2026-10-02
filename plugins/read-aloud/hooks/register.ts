import type { Register } from 'claude-code'

// STUB. Loads, validates, and answers /read-aloud with what it will become.
// The shape it is heading for: /say: $.process runs the system voice on the last assistant message
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'read-aloud', description: "Reads the last answer out loud." })
    return next(e)
  })

  on('command.run', { command: 'read-aloud' }, async () => {
    return { text: 'Not built yet. ' + "Reads the last answer out loud." }
  })
}
