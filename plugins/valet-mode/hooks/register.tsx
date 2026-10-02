import { atom, read, update } from 'claude-code'
import type { Engine, Register } from 'claude-code'

// Valet Mode: someone else is at your PC. Claude can look and talk, never touch.
// The lock lives in one file every Claude Code window reads, so turning it on in
// one window locks them all, and a restart does not unlock it.
const isOn = atom({ plugin: 'valet-mode', key: 'isOn' } as const, false)

// While Valet Mode is on, only tools that read are let through. Everything else,
// from file edits and shell commands to connectors that send mail, is refused.
const READ_ONLY = new Set(['Read', 'Grep', 'Glob', 'WebSearch', 'WebFetch'])

// How often an open window looks at the file, so its band appears and goes
// within a couple of seconds of another window changing the lock.
const LOOK_EVERY_MS = 2000

type Lock = { isOn: boolean; code: string }

const lockFile = async ($: Engine) => {
  const home = (await $.env.get('USERPROFILE')) ?? (await $.env.get('HOME')) ?? '.'
  return `${home.split(String.fromCharCode(92)).join('/')}/.claude/rostech/valet-mode.json`
}

const readLock = async ($: Engine): Promise<Lock> => {
  const file = await lockFile($)
  if (!(await $.fs.exists(file))) return { isOn: false, code: '' }
  try {
    const kept = JSON.parse(String(await $.fs.read(file))) as Partial<Lock>
    return { isOn: kept.isOn === true, code: String(kept.code ?? '') }
  } catch {
    // A lock file nobody can read counts as locked: a guest must not get the
    // keys because the file was damaged.
    return { isOn: true, code: '' }
  }
}

const writeLock = async ($: Engine, lock: Lock) => {
  await $.fs.write(await lockFile($), JSON.stringify(lock))
  await update($, isOn, () => lock.isOn)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'valet', description: 'Lock Claude to look-only for someone else at your PC. /valet on <code>, /valet off <code>.' })
    // 0.1.0 kept the lock in one window's plugin store. Carry a lock that is
    // still on into the shared file, so the update never unlocks anything.
    if ((await $.store.get('isOn')) === true) {
      const code = String((await $.store.get('code')) ?? '')
      if (!(await readLock($)).isOn) await writeLock($, { isOn: true, code })
      await $.store.set('isOn', false)
    }
    const sync = async () => {
      const lock = await readLock($)
      if (lock.isOn !== (await read($, isOn))) await update($, isOn, () => lock.isOn)
    }
    await sync()
    $.clock.every(LOOK_EVERY_MS, () => void sync())
    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    // The file is read on every call, never a copy, so a window opened before
    // the lock went on is locked from its very next tool call.
    if (!READ_ONLY.has(e.tool) && (await readLock($)).isOn) {
      return { deny: `Valet Mode is on: ${e.tool} is locked. Claude can read and answer, but cannot change anything until the owner turns Valet Mode off.` }
    }
    return next(e)
  })

  on('command.run', { command: 'valet' }, async ($, e) => {
    const [verb, ...rest] = e.args.trim().split(/\s+/)
    const code = rest.join(' ')
    const lock = await readLock($)
    if (verb === 'on') {
      if (lock.isOn) return { text: '🎩 Valet Mode is already on.' }
      if (code.length < 4) return { text: 'Pick a code of 4 or more characters: /valet on 1234. You need it to turn Valet Mode off.' }
      await writeLock($, { isOn: true, code })
      return { text: '🎩 Valet Mode on, in every Claude Code window. Claude can look and answer, but cannot change anything. /valet off <your code> unlocks it.' }
    }
    if (verb === 'off') {
      if (!lock.isOn) return { text: 'Valet Mode is already off.' }
      if (code !== lock.code) return { text: 'Wrong code. Valet Mode stays on.' }
      await writeLock($, { isOn: false, code: '' })
      return { text: 'Valet Mode off, in every window. Claude has its hands back.' }
    }
    return { text: lock.isOn ? '🎩 Valet Mode is on. Claude can look and answer, but cannot change anything.' : 'Valet Mode is off. /valet on <code> turns it on.' }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || !(await read($, isOn))) return next(e)
    const { Box, Text } = $.ui.resolve(e)
    const below = await next(e)
    return (
      <Box flexDirection="column">
        <Box flexDirection="row">
          <Text backgroundColor="yellow" color="black" bold> 🎩 VALET MODE </Text>
          <Text>  Claude can look and answer. It cannot change anything.</Text>
        </Box>
        {below}
      </Box>
    )
  })
}
