import type { EngineInterface, Register } from 'claude-code'

// Text copied out of a terminal drags the terminal along with it: box edges,
// prompt marks and padding. Clip strips those before the text lands.
function clean(text: string): string {
  const lines = text.split(/\r?\n/).map(line =>
    line
      .replace(/^\s*[│┃|]\s?/, '')
      .replace(/\s?[│┃|]\s*$/, '')
      .replace(/^\s*[>❯$]\s+/, '')
      .replace(/\s+$/, ''),
  )
  while (lines.length && !lines[0]) lines.shift()
  while (lines.length && !lines[lines.length - 1]) lines.pop()
  return lines.join('\n')
}

// Each system's own clipboard program, tried in order; the first that runs wins.
const COPIERS: readonly (readonly string[])[] = [
  ['powershell.exe', '-NoProfile', '-Command', '$input | Set-Clipboard'],
  ['pbcopy'],
  ['wl-copy'],
  ['xclip', '-selection', 'clipboard'],
]

async function copy($: EngineInterface, text: string): Promise<boolean> {
  for (const argv of COPIERS) {
    const ran = await $.process.run(argv, { stdin: text, timeoutMs: 5000 }).catch(() => null)
    if (ran && ran.exitCode === 0) return true
  }
  return false
}

export const register: Register = on => {
  // /clip can already belong to something of yours, a skill or another mod. When
  // it does, the mod answers to /clipboard instead, and the start carries on.
  on('session.start', async ($, e, next) => {
    const NAMES = ['clip', 'clipboard']
    for (const name of NAMES) {
      const ok = await $.command
        .register({ name, description: `Put text on your clipboard, cleaned of terminal clutter. /${name} <text>` })
        .then(() => true, () => false)
      if (ok) break
    }
    return next(e)
  })

  on('command.run', { command: 'clip' }, async ($, e) => ({ text: await clipText($, e.args) }))
  on('command.run', { command: 'clipboard' }, async ($, e) => ({ text: await clipText($, e.args) }))
}

async function clipText($: EngineInterface, args: string): Promise<string> {
  const text = clean(args)
  if (!text) return 'Nothing to copy. /clip <text> puts that text on your clipboard.'
  const ok = await copy($, text)
  if (!ok) return 'No clipboard program answered on this machine, so nothing was copied.'
  const chars = [...text].length
  return `📎 On your clipboard: ${chars} character${chars === 1 ? '' : 's'}.`
}
