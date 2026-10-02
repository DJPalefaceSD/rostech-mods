import type { Register } from 'claude-code'

// STUB. Loads, validates, and answers /needs-you-chime with what it will become.
// The shape it is heading for: turn.complete + permission/question events -> $.audio.play; /chime off
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'needs-you-chime', description: "Plays a sound when Claude finishes or needs an answer from you." })
    return next(e)
  })

  on('command.run', { command: 'needs-you-chime' }, async () => {
    return { text: 'Not built yet. ' + "Plays a sound when Claude finishes or needs an answer from you." }
  })
}
