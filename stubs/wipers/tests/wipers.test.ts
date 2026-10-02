import { expect, test } from 'claude-code/testing'

test('/wipers answers while it is a stub', async $ => {
  const answer = await $.command.run({ command: 'wipers', args: '' })
  expect(answer.text).toContain('Not built yet')
})
