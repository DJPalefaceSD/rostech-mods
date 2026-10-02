import type { Register } from 'claude-code'

// STUB. Loads, validates, and answers /human-signoff with what it will become.
// The shape it is heading for: tool.call guard on release commands; /signoff <thing> marks it
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'human-signoff', description: "Refuses a release step until a person marks it played." })
    return next(e)
  })

  on('command.run', { command: 'human-signoff' }, async () => {
    return { text: 'Not built yet. ' + "Refuses a release step until a person marks it played." }
  })
}
