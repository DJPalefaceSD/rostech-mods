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
