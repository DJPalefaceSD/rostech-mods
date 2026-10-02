import { expect, test } from 'claude-code/testing'

test('/house-style answers while it is a stub', async $ => {
  const answer = await $.command.run({ command: 'house-style', args: '' })
  expect(answer.text).toContain('Not built yet')
})
