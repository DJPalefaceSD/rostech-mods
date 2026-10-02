import { expect, test } from 'claude-code/testing'

const ok = { exitCode: 0, stdout: '', stderr: '', isStdoutTruncated: false, isStderrTruncated: false }

test('/pop opens a bare domain as a web page', async ($, on) => {
  const opened: string[] = []
  on('process.run', async (_, e) => { opened.push(String(e.init?.env?.POP_TARGET)); return { value: ok } })
  const answer = await $.command.run({ command: 'pop', args: 'example.com' })
  expect(answer.text).toBe('🌐 Opened: https://example.com')
  expect(opened[0]).toBe('https://example.com')
})

test('/pop leaves a file path as a file', async ($, on) => {
  on('process.run', async () => ({ value: ok }))
  expect((await $.command.run({ command: 'pop', args: 'C:/notes/plan.md' })).text).toBe('🌐 Opened: C:/notes/plan.md')
})
