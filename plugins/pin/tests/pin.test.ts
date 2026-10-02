import { expect, mock, test } from 'claude-code/testing'

test('/pin adds to-dos in order and /pin lists them', async ($, on) => {
  mock.store(on)
  expect((await $.command.run({ command: 'pin', args: 'call the printer' })).text).toBe('📋 Pinned 1: call the printer')
  expect((await $.command.run({ command: 'pin', args: 'send the invoice' })).text).toBe('📋 Pinned 2: send the invoice')
  expect((await $.command.run({ command: 'pin', args: '' })).text).toBe('📋 Pinned:\n1. call the printer\n2. send the invoice')
})

test('/pin done ticks one off and the next prompt says so, once', async ($, on) => {
  mock.store(on)
  const seen: string[] = []
  on('prompt.submit', (_, e) => { seen.push(e.text); return { text: e.text } as never })
  await $.command.run({ command: 'pin', args: 'call the printer' })
  expect((await $.command.run({ command: 'pin', args: 'done 1' })).text).toBe('✓ Done: call the printer')
  await $.prompt.submit({ text: 'hi' } as never)
  await $.prompt.submit({ text: 'again' } as never)
  expect(seen[0]).toContain('"call the printer"')
  expect(seen[1]).toBe('again')
})

test('/pin done with a wrong number lists what is pinned', async ($, on) => {
  mock.store(on)
  await $.command.run({ command: 'pin', args: 'call the printer' })
  expect((await $.command.run({ command: 'pin', args: 'done 5' })).text).toContain('1. call the printer')
})
