import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

// The pinned to-dos, in order. $.store keeps them across sessions; the atom redraws the band.
const items = atom({ plugin: 'pin', key: 'items' } as const, [] as string[])
// Items ticked off since the last prompt. The next prompt carries one line naming
// them, because ticking one off tells Claude what you just finished.
const done = atom({ plugin: 'pin', key: 'done' } as const, [] as string[])

function stamp(): string {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

async function save($: EngineInterface, next: string[]) {
  await $.store.set('items', next)
  await update($, items, () => next)
}

async function tick($: EngineInterface, index: number): Promise<string | undefined> {
  const now = await read($, items)
  const item = now[index]
  if (item === undefined) return undefined
  await save($, now.filter((_, i) => i !== index))
  await update($, done, d => [...d, item])
  return item
}

function listing(now: readonly string[]): string {
  return now.map((t, i) => `${i + 1}. ${t}`).join('\n')
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'pin', description: 'Pin to-dos above the prompt. /pin <text>, /pin done <number>, /pin clear.' })
    const kept = await $.store.get('items')
    await update($, items, () => (Array.isArray(kept) ? (kept as string[]) : []))
    return next(e)
  })

  on('command.run', { command: 'pin' }, async ($, e) => {
    const text = e.args.trim()
    const [verb, ...rest] = text.split(/\s+/)
    const now = await read($, items)
    if (!text) return { text: now.length ? `📋 Pinned:\n${listing(now)}` : 'Nothing pinned. /pin <text> pins a to-do above the prompt.' }
    if (verb.toLowerCase() === 'clear') {
      await save($, [])
      return { text: 'Pins cleared.' }
    }
    if (verb.toLowerCase() === 'done') {
      const n = Number(rest[0])
      const item = Number.isInteger(n) ? await tick($, n - 1) : undefined
      return { text: item ? `✓ Done: ${item}` : `No pin number ${rest[0] ?? ''}. ${now.length ? `Pinned:\n${listing(now)}` : 'Nothing is pinned.'}` }
    }
    await save($, [...now, text])
    return { text: `📋 Pinned ${now.length + 1}: ${text}` }
  })

  on('prompt.submit', async ($, e, next) => {
    const finished = await read($, done)
    if (!finished.length) return next(e)
    await update($, done, () => [])
    return next({ ...e, text: `${e.text}\n\n(📋 Ticked off at ${stamp()}: ${finished.map(f => `"${f}"`).join(', ')})` })
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const now = await read($, items)
    if (e.props.hasSurvey || !now.length) return next(e)

    const { Box, Button, Text } = $.ui.resolve(e)
    // The pins sit on their own lines; every other band above the prompt draws beneath them.
    const below = await next(e)
    return (
      <Box flexDirection="column">
        {now.map((t, i) => (
          <Box key={`pin-${i}`} flexDirection="row">
            <Text color="cyan" bold>📋 {i + 1}. </Text>
            <Text color="cyan">{t}  </Text>
            <Button key={`done-${i}`} label="Done" onPress={async () => { await tick($, i) }} />
          </Box>
        ))}
        {below}
      </Box>
    )
  })
}
