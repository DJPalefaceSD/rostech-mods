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
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'clip', description: 'Put text on your clipboard, cleaned of terminal clutter. /clip <text>' })
    return next(e)
  })

  on('command.run', { command: 'clip' }, async ($, e) => {
    const text = clean(e.args)
    if (!text) return { text: 'Nothing to copy. /clip <text> puts that text on your clipboard.' }
    const ok = await copy($, text)
    if (!ok) return { text: 'No clipboard program answered on this machine, so nothing was copied.' }
    const chars = [...text].length
    return { text: `📎 On your clipboard: ${chars} character${chars === 1 ? '' : 's'}.` }
  })
}
