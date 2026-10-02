import type { Register } from 'claude-code'

// STUB. Loads, validates, and answers /run-by-name with what it will become.
// The shape it is heading for: /t <name>: finds the script and runs it via $.process
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'run-by-name', description: "Runs a repo script by its bare name." })
    return next(e)
  })

  on('command.run', { command: 'run-by-name' }, async () => {
    return { text: 'Not built yet. ' + "Runs a repo script by its bare name." }
  })
}
