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

test('when /clip is taken, the start carries on and /clipboard answers', async ($, on) => {
  const tried: string[] = []
  on('command.register', async (_, e) => {
    tried.push(e.name)
    if (e.name === 'clip') return { deny: "refused: it is the user's /clip" }
    return { value: { command: e.name } }
  })
  on('session.start', async (_, e) => ({ cwd: e.cwd }))
  await $.session.start({ cwd: '/tmp' } as never)
  expect(tried).toEqual(['clip', 'clipboard'])
  expect((await $.command.run({ command: 'clipboard', args: '' })).text).toContain('Nothing to copy')
})
