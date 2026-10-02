import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

// Valet Mode: someone else is at your PC. Claude can look and talk, never touch.
// The lock and its code live in $.store, so a restart does not unlock it.
const isOn = atom({ plugin: 'valet-mode', key: 'isOn' } as const, false)

// While Valet Mode is on, only tools that read are let through. Everything else,
// from file edits and shell commands to connectors that send mail, is refused.
const READ_ONLY = new Set(['Read', 'Grep', 'Glob', 'WebSearch', 'WebFetch'])

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'valet', description: 'Lock Claude to look-only for someone else at your PC. /valet on <code>, /valet off <code>.' })
    const kept = await $.store.get('isOn')
    await update($, isOn, () => kept === true)
    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    if ((await read($, isOn)) && !READ_ONLY.has(e.tool)) {
      return { deny: `Valet Mode is on: ${e.tool} is locked. Claude can read and answer, but cannot change anything until the owner turns Valet Mode off.` }
    }
    return next(e)
  })

  on('command.run', { command: 'valet' }, async ($, e) => {
    const [verb, ...rest] = e.args.trim().split(/\s+/)
    const code = rest.join(' ')
    const locked = await read($, isOn)
    if (verb === 'on') {
      if (locked) return { text: '🎩 Valet Mode is already on.' }
      if (code.length < 4) return { text: 'Pick a code of 4 or more characters: /valet on 1234. You need it to turn Valet Mode off.' }
      await $.store.set('code', code)
      await $.store.set('isOn', true)
      await update($, isOn, () => true)
      return { text: '🎩 Valet Mode on. Claude can look and answer, but cannot change anything. /valet off <your code> unlocks it.' }
    }
    if (verb === 'off') {
      if (!locked) return { text: 'Valet Mode is already off.' }
      if (code !== (await $.store.get('code'))) return { text: 'Wrong code. Valet Mode stays on.' }
      await $.store.set('isOn', false)
      await $.store.set('code', '')
      await update($, isOn, () => false)
      return { text: 'Valet Mode off. Claude has its hands back.' }
    }
    return { text: locked ? '🎩 Valet Mode is on. Claude can look and answer, but cannot change anything.' : 'Valet Mode is off. /valet on <code> turns it on.' }
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
