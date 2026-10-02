import type { Register } from 'claude-code'

// STUB. Loads, validates, and answers /memory-trim with what it will become.
// The shape it is heading for: checks MEMORY.md size at session.start; band warns, /memory-trim splits it
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'memory-trim', description: "Keeps your memory index under the length Claude reads in full." })
    return next(e)
  })

  on('command.run', { command: 'memory-trim' }, async () => {
    return { text: 'Not built yet. ' + "Keeps your memory index under the length Claude reads in full." }
  })
}
