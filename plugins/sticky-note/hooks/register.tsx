import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

// The note on screen. $.store keeps it across sessions; this atom redraws the band.
const note = atom({ plugin: 'sticky-note', key: 'note' } as const, '')
// A note cleared since the last prompt. The next prompt carries one line saying so,
// because pressing Done tells Claude you are back at the screen.
const cleared = atom({ plugin: 'sticky-note', key: 'cleared' } as const, '')

function stamp(): string {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'note', description: 'Stick a note above the prompt. /note <text> sets it, /note done clears it.' })
    const kept = await $.store.get('note')
    await update($, note, () => (typeof kept === 'string' ? kept : ''))
    return next(e)
  })

  on('command.run', { command: 'note' }, async ($, e) => {
    const text = e.args.trim()
    if (text.toLowerCase() === 'done') {
      const was = await read($, note)
      await $.store.delete('note')
      await update($, note, () => '')
      if (was) await update($, cleared, () => `📌 Sticky note cleared at ${stamp()}: "${was}"`)
      return { text: 'Note cleared.' }
    }
    if (!text) {
      const now = await read($, note)
      return { text: now ? `📌 ${now}` : 'No note. /note <text> sticks one above the prompt.' }
    }
    await $.store.set('note', text)
    await update($, note, () => text)
    return { text: `📌 ${text}` }
  })

  on('prompt.submit', async ($, e, next) => {
    const line = await read($, cleared)
    if (!line) return next(e)
    await update($, cleared, () => '')
    return next({ ...e, text: `${e.text}

(${line})` })
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const now = await read($, note)
    if (e.props.hasSurvey || !now) return next(e)

    const { Box, Button, Text } = $.ui.resolve(e)
    // The note sits on its own line; every other band above the prompt draws beneath it.
    const below = await next(e)
    return (
      <Box flexDirection="column">
        <Box flexDirection="row">
          <Text color="yellow" bold>📌 </Text>
          <Text color="yellow">{now}  </Text>
          <Button
            key="done"
            label="Done"
            onPress={async () => {
              await $.store.delete('note')
              await update($, note, () => '')
              await update($, cleared, () => `📌 Sticky note cleared at ${stamp()}: "${now}"`)
            }}
          />
        </Box>
        {below}
      </Box>
    )
  })
}
