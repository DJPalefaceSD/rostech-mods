import { expect, mock, test } from 'claude-code/testing'

const refused = (r: object) => 'deny' in r || (r as { isError?: boolean }).isError === true

// The engine hands paths over in the machine's own form, backslashes on Windows.
const LOCK = 'C:\\Users\\guest\\.claude\\rostech\\valet-mode.json'

// The disk every window shares, in memory: one map stands for the one file.
const disk = (on: any, files: Map<string, string>) => {
  mock.env(on, { USERPROFILE: 'C:\\Users\\guest' })
  on('fs.exists', (_: unknown, e: { path: string }) => ({ value: files.has(e.path) }))
  on('fs.read', (_: unknown, e: { path: string }) => ({ value: files.get(e.path) ?? '' }))
  on('fs.write', (_: unknown, e: { path: string; text: string }) => { files.set(e.path, e.text); return { value: undefined } })
}

test('Valet Mode locks edits and the shell, lets reading through, and unlocks with the code', async ($, on) => {
  mock.store(on)
  disk(on, new Map())
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

test('A lock turned on in another window holds in this one, and its code unlocks it here', async ($, on) => {
  mock.store(on)
  disk(on, new Map([[LOCK, JSON.stringify({ isOn: true, code: '4821' })]]))
  on('tool.call', () => ({ result: 'ok' }))
  expect(refused(await $.tool.call({ tool: 'Edit', file_path: 'C:/proj/a.md', old_string: 'a', new_string: 'b' }))).toBe(true)
  expect((await $.command.run({ command: 'valet', args: '' })).text).toContain('Valet Mode is on')
  expect((await $.command.run({ command: 'valet', args: 'off 4821' })).text).toContain('Valet Mode off')
  expect(refused(await $.tool.call({ tool: 'Edit', file_path: 'C:/proj/a.md', old_string: 'a', new_string: 'b' }))).toBe(false)
})

test('A damaged lock file stays locked', async ($, on) => {
  mock.store(on)
  disk(on, new Map([[LOCK, '{not json']]))
  on('tool.call', () => ({ result: 'ok' }))
  expect(refused(await $.tool.call({ tool: 'Bash', command: 'del notes.md' }))).toBe(true)
})

test('Valet Mode needs a code of 4 or more characters', async ($, on) => {
  mock.store(on)
  disk(on, new Map())
  expect((await $.command.run({ command: 'valet', args: 'on 12' })).text).toContain('4 or more')
  expect((await $.command.run({ command: 'valet', args: '' })).text).toContain('Valet Mode is off')
})
