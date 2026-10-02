import { expect, mock, test } from 'claude-code/testing'


test('/note sticks a note and /note reads it back', async ($, on) => {
  mock.store(on)
  const set = await $.command.run({ command: 'note', args: 'call the printer' })
  expect(set.text).toBe('📌 call the printer')
  const back = await $.command.run({ command: 'note', args: '' })
  expect(back.text).toBe('📌 call the printer')
})

test('/note done clears it', async ($, on) => {
  mock.store(on)
  await $.command.run({ command: 'note', args: 'call the printer' })
  const done = await $.command.run({ command: 'note', args: 'done' })
  expect(done.text).toBe('Note cleared.')
  const back = await $.command.run({ command: 'note', args: '' })
  expect(back.text).toContain('No note')
})

test('the next prompt says the note was cleared, once', async ($, on) => {
  mock.store(on)
  const seen: string[] = []
  on('prompt.submit', (_, e) => { seen.push(e.text); return { text: e.text } as never })
  await $.command.run({ command: 'note', args: 'call the printer' })
  await $.command.run({ command: 'note', args: 'done' })
  await $.prompt.submit({ text: 'hi' } as never)
  await $.prompt.submit({ text: 'again' } as never)
  expect(seen[0]).toContain('Sticky note cleared at')
  expect(seen[0]).toContain('"call the printer"')
  expect(seen[1]).toBe('again')
})
