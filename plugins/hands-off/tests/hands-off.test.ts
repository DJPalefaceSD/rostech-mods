import { expect, test } from 'claude-code/testing'

test('/hands-off answers while it is a stub', async $ => {
  const answer = await $.command.run({ command: 'hands-off', args: '' })
  expect(answer.text).toContain('Not built yet')
})
