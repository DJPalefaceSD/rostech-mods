import { expect, test } from 'claude-code/testing'

test('/clip answers while it is a stub', async $ => {
  const answer = await $.command.run({ command: 'clip', args: '' })
  expect(answer.text).toContain('Not built yet')
})
