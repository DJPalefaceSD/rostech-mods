import type { Register } from 'claude-code'

// STUB. Loads, validates, and answers /tool-gaps with what it will become.
// The shape it is heading for: reads session transcripts via $.fs; pane with the top repeats; /tool-gaps
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'tool-gaps', description: "Finds the commands you keep typing by hand that should be tools." })
    return next(e)
  })

  on('command.run', { command: 'tool-gaps' }, async () => {
    return { text: 'Not built yet. ' + "Finds the commands you keep typing by hand that should be tools." }
  })
}
