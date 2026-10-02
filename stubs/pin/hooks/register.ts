import type { Register } from 'claude-code'

// STUB. Loads, validates, and answers /pin with what it will become.
// The shape it is heading for: AbovePrompt band; /pin add, /pin done <n>; kept in $.store
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'pin', description: "A pinned to-do band above the prompt." })
    return next(e)
  })

  on('command.run', { command: 'pin' }, async () => {
    return { text: 'Not built yet. ' + "A pinned to-do band above the prompt." }
  })
}
