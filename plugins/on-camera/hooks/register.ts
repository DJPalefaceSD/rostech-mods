import type { Register } from 'claude-code'

// STUB. Loads, validates, and answers /on-camera with what it will become.
// The shape it is heading for: tool.call: await next(e), redact the result; /on-camera on|off; band says LIVE when on
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'on-camera', description: "Streaming mode. Hides names, paths and keys you list from tool output before they reach the screen." })
    return next(e)
  })

  on('command.run', { command: 'on-camera' }, async () => {
    return { text: 'Not built yet. ' + "Streaming mode. Hides names, paths and keys you list from tool output before they reach the screen." }
  })
}
