import type { Register } from 'claude-code'

// STUB. Loads, validates, and answers /seatbelt with what it will become.
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'seatbelt', description: "A backup taken automatically before anything risky. A working idea; he may pick something else." })
    return next(e)
  })

  on('command.run', { command: 'seatbelt' }, async () => {
    return { text: 'Not built yet. ' + "A backup taken automatically before anything risky. A working idea; he may pick something else." }
  })
}
