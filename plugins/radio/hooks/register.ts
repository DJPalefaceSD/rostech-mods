import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

// A chime when Claude finishes a turn long enough that you looked away.
const isOff = atom({ plugin: 'radio', key: 'isOff' } as const, false)
const startedAt = atom({ plugin: 'radio', key: 'startedAt' } as const, 0)
const LONG_MS = 20_000
const DONE = 'sounds/done.wav'
const WHISTLE = 'sounds/whistle.wav'

// Claude Code's own player skips a Windows terminal, so Windows plays the file
// with its built-in SoundPlayer; everywhere else the engine plays it.
async function play($: EngineInterface, clip: string) {
  const file = `${$.plugin.root}/${clip}`.split('/').join(String.fromCharCode(92))
  const win = await $.process
    .run(['powershell.exe', '-NoProfile', '-Command', `(New-Object Media.SoundPlayer '${file}').PlaySync()`])
    .catch(() => null)
  if (!win || win.exitCode !== 0) await $.audio.play({ asset: clip }).catch(() => undefined)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'radio', description: 'A chime when a long turn finishes. /radio off, /radio on, /radio test.' })
    return next(e)
  })

  on('turn.start', async ($, e, next) => {
    const now = await $.clock.now()
    await update($, startedAt, () => now)
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const began = await read($, startedAt)
    const took = (await $.clock.now()) - began
    if (began && took >= LONG_MS && !(await read($, isOff))) void play($, DONE)
    return next(e)
  })

  on('command.run', { command: 'radio' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    if (arg === 'off' || arg === 'on') {
      await update($, isOff, () => arg === 'off')
      return { text: arg === 'off' ? 'Radio off.' : 'Radio on. A chime plays when a turn longer than 20 seconds finishes.' }
    }
    if (arg === 'test') {
      // The done chime, then the whistle, one after the other.
      void play($, DONE).then(() => play($, WHISTLE))
      return { text: 'Playing the done chime, then the whistle.' }
    }
    return { text: (await read($, isOff)) ? 'Radio is off. /radio on turns it on.' : 'Radio is on. A chime plays when a turn longer than 20 seconds finishes.' }
  })
}
