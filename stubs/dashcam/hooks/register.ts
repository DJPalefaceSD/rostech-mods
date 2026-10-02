import type { Register } from 'claude-code'

// STUB. Loads, validates, and answers /dashcam with what it will become.
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'dashcam', description: "Records what Claude did while you were away, to play back later." })
    return next(e)
  })

  on('command.run', { command: 'dashcam' }, async () => {
    return { text: 'Not built yet. ' + "Records what Claude did while you were away, to play back later." }
  })
}
