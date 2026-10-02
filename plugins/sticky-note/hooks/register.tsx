import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

// The note on screen. $.store keeps it across sessions; this atom redraws the band.
const note = atom({ plugin: 'sticky-note', key: 'note' } as const, '')

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
      await $.store.delete('note')
      await update($, note, () => '')
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
            }}
          />
        </Box>
        {below}
      </Box>
    )
  })
}
