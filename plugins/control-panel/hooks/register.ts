import type { Register } from 'claude-code'

// STUB. Loads, validates, and answers /control-panel with what it will become.
// The shape it is heading for: Pane from a user config file; Buttons flip each knob
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'control-panel', description: "A pane of every setting you use, with the word that changes each one." })
    return next(e)
  })

  on('command.run', { command: 'control-panel' }, async () => {
    return { text: 'Not built yet. ' + "A pane of every setting you use, with the word that changes each one." }
  })
}
