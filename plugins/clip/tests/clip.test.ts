import { expect, test } from 'claude-code/testing'

test('/clip hands cleaned text to the clipboard program', async ($, on) => {
  const given: string[] = []
  on('process.run', async (_, e) => { given.push(String(e.init?.stdin)); return { value: { exitCode: 0, stdout: '', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } } })
  const answer = await $.command.run({ command: 'clip', args: '│ hello world   │' })
  expect(answer.text).toBe('📎 On your clipboard: 11 characters.')
  expect(given[0]).toBe('hello world')
})

test('/clip with nothing says so', async $ => {
  expect((await $.command.run({ command: 'clip', args: '' })).text).toContain('Nothing to copy')
})
