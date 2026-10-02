import { expect, test } from 'claude-code/testing'

test('/human-signoff answers while it is a stub', async $ => {
  const answer = await $.command.run({ command: 'human-signoff', args: '' })
  expect(answer.text).toContain('Not built yet')
})
