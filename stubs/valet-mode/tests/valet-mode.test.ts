import { expect, test } from 'claude-code/testing'

test('/valet-mode answers while it is a stub', async $ => {
  const answer = await $.command.run({ command: 'valet-mode', args: '' })
  expect(answer.text).toContain('Not built yet')
})
