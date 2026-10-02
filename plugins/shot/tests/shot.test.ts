import { expect, test } from 'claude-code/testing'

test('/shot saves the clipboard picture and puts its path in the prompt box', async ($, on) => {
  const sent: string[] = []
  on('process.run', async () => ({ value: { exitCode: 0, stdout: 'C:/Temp/shot-1.png\n', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }))
  on('prompt.fill', async (_, e) => { sent.push(e.text); return { isFilled: true } as never })
  const answer = await $.command.run({ command: 'shot', args: 'is the band lined up?' })
  expect(answer.text).toBe('📸 Saved: C:/Temp/shot-1.png. Press Enter to send it to Claude.')
  expect(sent[0]).toContain('C:/Temp/shot-1.png')
  expect(sent[0]).toContain('is the band lined up?')
})

test('/shot with no picture says so', async ($, on) => {
  on('process.run', async () => ({ value: { exitCode: 0, stdout: '', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }))
  expect((await $.command.run({ command: 'shot', args: '' })).text).toContain('No picture on the clipboard')
})
