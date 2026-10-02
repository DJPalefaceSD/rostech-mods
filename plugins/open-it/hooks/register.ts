import type { Register } from 'claude-code'

// STUB. Loads, validates, and answers /open-it with what it will become.
// The shape it is heading for: /pop <url|file> and /tabs <files...> via $.process
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'open-it', description: "Opens a result in your browser, with markdown rendered first." })
    return next(e)
  })

  on('command.run', { command: 'open-it' }, async () => {
    return { text: 'Not built yet. ' + "Opens a result in your browser, with markdown rendered first." }
  })
}
