import { expect, test } from 'claude-code/testing'

const SPINNER = { component: 'Spinner', requestId: 'main', props: { word: 'Baking', message: null, suffix: '…', mode: 'thinking' } } as const

// The test's own hook sits beneath the plugin, so it sees the word the plugin handed on.
function catchWord(on: Parameters<Parameters<typeof test>[1]>[1]) {
  const seen: string[] = []
  // Standing in for the engine: it draws the line as one Text, the word on it.
  on('ui.render', { component: 'Spinner' }, ($, e) => {
    seen.push(String(e.props.word))
    const { Text } = $.ui.resolve(e)
    return <Text>{String(e.props.word)}</Text>
  })
  return seen
}

test('the busy word comes from the print-shop set by default', async ($, on) => {
  const seen = catchWord(on)
  const ui = await $.ui.mount({ plugin: 'bumper-sticker', surface: 'terminal', ...SPINNER })
  await ui.unmount()
  expect(seen.length > 0).toBe(true)
  expect(seen[0] === 'Baking').toBe(false)
  expect(seen[0].length > 0).toBe(true)
})

test('your own words replace the set', { options: { words: 'Revving, Idling , Drifting' } }, async ($, on) => {
  const seen = catchWord(on)
  const ui = await $.ui.mount({ plugin: 'bumper-sticker', surface: 'terminal', ...SPINNER })
  await ui.unmount()
  expect(['Revving', 'Idling', 'Drifting'].includes(seen[0])).toBe(true)
})

test('one turn keeps one word', async ($, on) => {
  const seen = catchWord(on)
  for (let i = 0; i < 3; i++) {
    const ui = await $.ui.mount({ plugin: 'bumper-sticker', surface: 'terminal', ...SPINNER })
    await ui.unmount()
  }
  expect(new Set(seen).size).toBe(1)
})

test('it works on the desktop too', async ($, on) => {
  const seen = catchWord(on)
  const ui = await $.ui.mount({ plugin: 'bumper-sticker', surface: 'desktop', ...SPINNER })
  await ui.unmount()
  expect(seen[0] === 'Baking').toBe(false)
})
