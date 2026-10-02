import type { Register } from 'claude-code'

// STUB. Loads, validates, and answers /clock with what it will become.
// The shape it is heading for: status line clock refreshed on a $.clock timer
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'clock', description: "The real time on the dash, read at the moment you look." })
    return next(e)
  })

  on('command.run', { command: 'clock' }, async () => {
    return { text: 'Not built yet. ' + "The real time on the dash, read at the moment you look." }
  })
}
