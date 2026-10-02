import type { Register } from 'claude-code'

// STUB. Loads, validates, and answers /perm-audit with what it will become.
// The shape it is heading for: reads permission rules via $.fs; pane lists allow, ask and deny
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'perm-audit', description: "A pane of what this machine lets Claude do, read from settings." })
    return next(e)
  })

  on('command.run', { command: 'perm-audit' }, async () => {
    return { text: 'Not built yet. ' + "A pane of what this machine lets Claude do, read from settings." }
  })
}
