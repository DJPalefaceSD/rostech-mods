import type { Register } from 'claude-code'

// STUB. Loads, validates, and answers /clip with what it will become.
// The shape it is heading for: /clip <text> or the last code block; strips box rules and prompts
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'clip', description: "Puts a value on your clipboard, cleaned of terminal decoration." })
    return next(e)
  })

  on('command.run', { command: 'clip' }, async () => {
    return { text: 'Not built yet. ' + "Puts a value on your clipboard, cleaned of terminal decoration." }
  })
}
