import type { Register } from 'claude-code'

// STUB. Loads, validates, and answers /drop-folder with what it will become.
// The shape it is heading for: $.clock timer + $.fs list; band shows the count; /drop opens the list
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'drop-folder', description: "A band when files are waiting in a folder you name, like a phone drop." })
    return next(e)
  })

  on('command.run', { command: 'drop-folder' }, async () => {
    return { text: 'Not built yet. ' + "A band when files are waiting in a folder you name, like a phone drop." }
  })
}
