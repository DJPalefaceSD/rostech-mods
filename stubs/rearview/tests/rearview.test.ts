import { expect, test } from 'claude-code/testing'

test('/rearview answers while it is a stub', async $ => {
  const answer = await $.command.run({ command: 'rearview', args: '' })
  expect(answer.text).toContain('Not built yet')
})
