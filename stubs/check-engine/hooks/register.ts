import type { Register } from 'claude-code'

// STUB. Loads, validates, and answers /check-engine with what it will become.
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'check-engine', description: "His name, 2 Oct 2026. What it does is not decided yet." })
    return next(e)
  })

  on('command.run', { command: 'check-engine' }, async () => {
    return { text: 'Not built yet. ' + "His name, 2 Oct 2026. What it does is not decided yet." }
  })
}
