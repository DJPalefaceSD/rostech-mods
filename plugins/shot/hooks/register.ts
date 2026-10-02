import type { EngineInterface, Register } from 'claude-code'

// Saves the picture on the clipboard as a PNG and prints its path, or prints
// nothing when the clipboard holds no picture. Windows first, then Wayland,
// then X11; macOS needs `pngpaste` installed.
const SAVERS: readonly (readonly string[])[] = [
  [
    'powershell.exe', '-NoProfile', '-Command',
    'Add-Type -AssemblyName System.Windows.Forms; $i = [System.Windows.Forms.Clipboard]::GetImage(); ' +
      'if ($i) { $p = Join-Path $env:TEMP ("shot-" + (Get-Date -Format yyyyMMdd-HHmmss) + ".png"); $i.Save($p); $p }',
  ],
  ['sh', '-c', 'p="${TMPDIR:-/tmp}/shot-$(date +%Y%m%d-%H%M%S).png"; wl-paste --type image/png > "$p" 2>/dev/null && [ -s "$p" ] && echo "$p"'],
  ['sh', '-c', 'p="${TMPDIR:-/tmp}/shot-$(date +%Y%m%d-%H%M%S).png"; xclip -selection clipboard -t image/png -o > "$p" 2>/dev/null && [ -s "$p" ] && echo "$p"'],
  ['sh', '-c', 'p="${TMPDIR:-/tmp}/shot-$(date +%Y%m%d-%H%M%S).png"; pngpaste "$p" 2>/dev/null && echo "$p"'],
]

async function save($: EngineInterface): Promise<string> {
  for (const argv of SAVERS) {
    const ran = await $.process.run(argv, { timeoutMs: 10000 }).catch(() => null)
    const path = ran && ran.exitCode === 0 ? ran.stdout.trim().split(/\r?\n/).pop() ?? '' : ''
    if (path) return path
  }
  return ''
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'shot', description: 'Hand Claude the picture on your clipboard. /shot, or /shot <what to look for>' })
    return next(e)
  })

  on('command.run', { command: 'shot' }, async ($, e) => {
    const path = await save($)
    if (!path) return { text: 'No picture on the clipboard. Snip or copy one first, then /shot.' }
    const ask = e.args.trim() || 'Look at it and tell me what you see.'
    // A command cannot send a prompt while it runs, so the message goes into the
    // prompt box ready to send: one Enter, and room to add words first.
    await $.prompt.fill({ text: `Here is a screenshot I just took: ${path}\n\n${ask}`, mode: 'replace' })
    return { text: `📸 Saved: ${path}. Press Enter to send it to Claude.` }
  })
}
