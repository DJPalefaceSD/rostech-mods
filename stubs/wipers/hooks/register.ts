import type { Register } from 'claude-code'

// STUB. Loads, validates, and answers /wipers with what it will become.
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'wipers', description: "Hides the bands above the prompt for a clear screen. Nothing is deleted; one more press brings them back." })
    return next(e)
  })

  on('command.run', { command: 'wipers' }, async () => {
    return { text: 'Not built yet. ' + "Hides the bands above the prompt for a clear screen. Nothing is deleted; one more press brings them back." }
  })
}
