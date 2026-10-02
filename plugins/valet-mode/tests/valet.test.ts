import { expect, mock, test } from 'claude-code/testing'

const refused = (r: object) => 'deny' in r || (r as { isError?: boolean }).isError === true

test('Valet Mode locks edits and the shell, lets reading through, and unlocks with the code', async ($, on) => {
  mock.store(on)
  on('tool.call', () => ({ result: 'ok' }))
  expect((await $.command.run({ command: 'valet', args: 'on 4821' })).text).toContain('Valet Mode on')
  expect(refused(await $.tool.call({ tool: 'Write', file_path: 'C:/proj/a.md', content: 'x' }))).toBe(true)
  expect(refused(await $.tool.call({ tool: 'Bash', command: 'git push' }))).toBe(true)
  expect(refused(await $.tool.call({ tool: 'Read', file_path: 'C:/proj/a.md' }))).toBe(false)
  expect((await $.command.run({ command: 'valet', args: 'off 0000' })).text).toBe('Wrong code. Valet Mode stays on.')
  expect(refused(await $.tool.call({ tool: 'Write', file_path: 'C:/proj/a.md', content: 'x' }))).toBe(true)
  expect((await $.command.run({ command: 'valet', args: 'off 4821' })).text).toContain('Valet Mode off')
  expect(refused(await $.tool.call({ tool: 'Write', file_path: 'C:/proj/a.md', content: 'x' }))).toBe(false)
})

test('Valet Mode needs a code of 4 or more characters', async ($, on) => {
  mock.store(on)
  expect((await $.command.run({ command: 'valet', args: 'on 12' })).text).toContain('4 or more')
  expect((await $.command.run({ command: 'valet', args: '' })).text).toContain('Valet Mode is off')
})
