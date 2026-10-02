import type { Register } from 'claude-code'

// STUB. Loads, validates, and answers /page-pile with what it will become.
// The shape it is heading for: tool.call on Artifact: after next(e), copy the file into a pile folder with a date stamp
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'page-pile', description: "Keeps a dated local copy of every artifact page Claude publishes. Only ever adds." })
    return next(e)
  })

  on('command.run', { command: 'page-pile' }, async () => {
    return { text: 'Not built yet. ' + "Keeps a dated local copy of every artifact page Claude publishes. Only ever adds." }
  })
}
