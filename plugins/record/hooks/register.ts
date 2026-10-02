import type { Register } from 'claude-code'

// STUB. Loads, validates, and answers /record with what it will become.
// The shape it is heading for: turn.complete appends the prompt and answer to a dated markdown file via $.fs
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'record', description: "Writes every exchange to a dated file you keep." })
    return next(e)
  })

  on('command.run', { command: 'record' }, async () => {
    return { text: 'Not built yet. ' + "Writes every exchange to a dated file you keep." }
  })
}
