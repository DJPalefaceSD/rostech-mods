import type { Register } from 'claude-code'

// STUB. Loads, validates, and answers /leak-guard with what it will become.
// The shape it is heading for: tool.call guard on Bash git commit: scans the staged diff for listed patterns
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'leak-guard', description: "Refuses a git commit that carries a value you listed as private." })
    return next(e)
  })

  on('command.run', { command: 'leak-guard' }, async () => {
    return { text: 'Not built yet. ' + "Refuses a git commit that carries a value you listed as private." }
  })
}
