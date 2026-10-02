import type { Register } from 'claude-code'

// STUB. Loads, validates, and answers /house-style with what it will become.
// The shape it is heading for: prompt.compose adds one section from a STYLE.md; /style off|on; status line shows it is on
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'house-style', description: "Your reply rules, sent to Claude every turn, with one switch to turn them off." })
    return next(e)
  })

  on('command.run', { command: 'house-style' }, async () => {
    return { text: 'Not built yet. ' + "Your reply rules, sent to Claude every turn, with one switch to turn them off." }
  })
}
