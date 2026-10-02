import type { Register } from 'claude-code'

// STUB. Loads, validates, and answers /sticky-note with what it will become.
// The shape it is heading for: AbovePrompt band; /note to set, /note done to clear; kept in $.store across sessions
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'sticky-note', description: "A note that sits above the prompt until you clear it." })
    return next(e)
  })

  on('command.run', { command: 'sticky-note' }, async () => {
    return { text: 'Not built yet. ' + "A note that sits above the prompt until you clear it." }
  })
}
