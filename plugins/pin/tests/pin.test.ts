import { expect, test } from 'claude-code/testing'

test('/pin answers while it is a stub', async $ => {
  const answer = await $.command.run({ command: 'pin', args: '' })
  expect(answer.text).toContain('Not built yet')
})
