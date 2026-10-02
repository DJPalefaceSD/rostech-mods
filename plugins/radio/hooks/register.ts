import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

// A chime when Claude finishes a turn long enough that you looked away.
const isOff = atom({ plugin: 'radio', key: 'isOff' } as const, false)
const startedAt = atom({ plugin: 'radio', key: 'startedAt' } as const, 0)
// Your own chime, by absolute path; empty plays the bundled one. $.store keeps it.
const ownSound = atom({ plugin: 'radio', key: 'ownSound' } as const, '')
const LONG_MS = 20_000
const DONE = 'sounds/done.wav'
const WHISTLE = 'sounds/whistle.wav'

// Claude Code's own player skips a Windows terminal, so Windows plays the file
// with its built-in SoundPlayer; everywhere else the engine plays it. The path
// goes in as an environment value, never inside the command.
async function playFile($: EngineInterface, file: string): Promise<boolean> {
  const win = await $.process
    .run(['powershell.exe', '-NoProfile', '-Command', '(New-Object Media.SoundPlayer $env:RADIO_FILE).PlaySync()'], {
      env: { RADIO_FILE: file.split('/').join(String.fromCharCode(92)) },
    })
    .catch(() => null)
  return !!win && win.exitCode === 0
}

async function play($: EngineInterface, clip: string) {
  if (!(await playFile($, `${$.plugin.root}/${clip}`))) await $.audio.play({ asset: clip }).catch(() => undefined)
}

// The chime for a finished turn: yours when you set one, else the bundled one.
async function chime($: EngineInterface) {
  const own = await read($, ownSound)
  if (own && (await playFile($, own))) return
  await play($, DONE)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'radio', description: 'A chime when a long turn finishes. /radio sound <a .wav>, /radio off, /radio on, /radio test.' })
    const kept = await $.store.get('ownSound')
    if (typeof kept === 'string') await update($, ownSound, () => kept)
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
    if (began && took >= LONG_MS && !(await read($, isOff))) void chime($)
    return next(e)
  })

  on('command.run', { command: 'radio' }, async ($, e) => {
    const [verb, ...rest] = e.args.trim().split(/\s+/)
    const arg = verb.toLowerCase()
    if (arg === 'off' || arg === 'on') {
      await update($, isOff, () => arg === 'off')
      return { text: arg === 'off' ? 'Radio off.' : 'Radio on. A chime plays when a turn longer than 20 seconds finishes.' }
    }
    if (arg === 'sound') {
      const path = rest.join(' ').replace(/^"|"$/g, '')
      if (!path || path.toLowerCase() === 'default') {
        await update($, ownSound, () => '')
        await $.store.set('ownSound', '')
        return { text: 'Radio plays its own chime again.' }
      }
      if (!/\.wav$/i.test(path)) return { text: 'The sound has to be a .wav file. /radio sound C:/path/to/chime.wav' }
      if (!(await playFile($, path))) return { text: `Could not play ${path}. Check the path, and that it is a .wav.` }
      await update($, ownSound, () => path)
      await $.store.set('ownSound', path)
      return { text: `Radio now plays ${path}. That was it. /radio sound default goes back.` }
    }
    if (arg === 'test') {
      // Your chime (or the bundled one), then the whistle, one after the other.
      void chime($).then(() => play($, WHISTLE))
      return { text: 'Playing the done chime, then the whistle.' }
    }
    const own = await read($, ownSound)
    const which = own ? ` It plays ${own}.` : ''
    return { text: (await read($, isOff)) ? 'Radio is off. /radio on turns it on.' : `Radio is on. A chime plays when a turn longer than 20 seconds finishes.${which}` }
  })
}
