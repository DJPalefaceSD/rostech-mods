import { expect, mock, test } from 'claude-code/testing'

test('a marked file cannot be edited, and can after release', async ($, on) => {
  mock.store(on)
  on('tool.call', () => ({ result: 'ok' }))
  await $.command.run({ command: 'hands-off', args: 'C:/proj/notes/plan.md' })
  const held = await $.tool.call({ tool: 'Edit', file_path: String.raw`C:\proj\notes\plan.md`, old_string: 'a', new_string: 'b' })
  expect('deny' in held || held.isError === true).toBe(true)
  await $.command.run({ command: 'hands-off', args: 'release C:/proj/notes/plan.md' })
  const free = await $.tool.call({ tool: 'Edit', file_path: String.raw`C:\proj\notes\plan.md`, old_string: 'a', new_string: 'b' })
  expect('deny' in free || free.isError === true).toBe(false)
})

test('a marked folder covers the files inside it', async ($, on) => {
  mock.store(on)
  on('tool.call', () => ({ result: 'ok' }))
  await $.command.run({ command: 'hands-off', args: 'C:/proj/docs' })
  const held = await $.tool.call({ tool: 'Write', file_path: 'C:/proj/docs/a.md', content: 'x' })
  expect('deny' in held || held.isError === true).toBe(true)
})
