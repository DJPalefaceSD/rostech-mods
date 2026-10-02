import { expect, test } from 'claude-code/testing'

test('/open-it answers while it is a stub', async $ => {
  const answer = await $.command.run({ command: 'open-it', args: '' })
  expect(answer.text).toContain('Not built yet')
})
