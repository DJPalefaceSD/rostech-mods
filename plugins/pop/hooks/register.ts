import type { EngineInterface, Register } from 'claude-code'

// Each system's own "open this" program, tried in order; the first that runs wins.
function openers(target: string): readonly (readonly string[])[] {
  return [
    ['powershell.exe', '-NoProfile', '-Command', 'Start-Process -FilePath $env:POP_TARGET'],
    ['open', target],
    ['xdg-open', target],
  ]
}

async function open($: EngineInterface, target: string): Promise<boolean> {
  for (const argv of openers(target)) {
    const ran = await $.process
      .run(argv, { env: { POP_TARGET: target }, timeoutMs: 8000 })
      .catch(() => null)
    if (ran && ran.exitCode === 0) return true
  }
  return false
}

// A bare domain gets https in front, so "/pop example.com" opens a page and not a file.
function target(arg: string): string {
  const t = arg.trim().replace(/^"|"$/g, '')
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(t)) return t
  if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(t) && !/\.(md|txt|html?|png|jpe?g|pdf|json)$/i.test(t)) return `https://${t}`
  return t
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'pop', description: 'Open a link or a file in its own app, in a window of its own. /pop <url or path>' })
    return next(e)
  })

  on('command.run', { command: 'pop' }, async ($, e) => {
    const t = target(e.args)
    if (!t) return { text: 'Nothing to open. /pop <url or path> opens it in a window of its own.' }
    const ok = await open($, t)
    return { text: ok ? `🌐 Opened: ${t}` : `Could not open ${t} on this machine.` }
  })
}
