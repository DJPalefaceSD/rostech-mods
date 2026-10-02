import type { Register } from 'claude-code'

// STUB. Loads, validates, and answers /hands-off with what it will become.
// The shape it is heading for: tool.call guard on Edit/Write/Bash; /hands-off add <path>, /hands-off list
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'hands-off', description: "Files you mark as yours. Claude cannot edit them until you say so." })
    return next(e)
  })

  on('command.run', { command: 'hands-off' }, async () => {
    return { text: 'Not built yet. ' + "Files you mark as yours. Claude cannot edit them until you say so." }
  })
}
