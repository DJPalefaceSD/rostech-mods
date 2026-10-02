import type { Register } from 'claude-code'

// STUB. Loads, validates, and answers /skins with what it will become.
// The shape it is heading for: ui.render rewrites of the parts mods may restyle; /skin <name>
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'skins', description: "Claude Code wearing a colour skin of your choice." })
    return next(e)
  })

  on('command.run', { command: 'skins' }, async () => {
    return { text: 'Not built yet. ' + "Claude Code wearing a colour skin of your choice." }
  })
}
