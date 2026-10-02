import type { Register } from 'claude-code'

// STUB. Loads, validates, and answers /horn with what it will become.
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'horn', description: "For emergencies only: a loud alarm when something has gone badly wrong. Radio is the everyday chime." })
    return next(e)
  })

  on('command.run', { command: 'horn' }, async () => {
    return { text: 'Not built yet. ' + "For emergencies only: a loud alarm when something has gone badly wrong. Radio is the everyday chime." }
  })
}
