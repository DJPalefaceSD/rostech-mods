import { expect, test } from 'claude-code/testing'

test('/clock answers while it is a stub', async $ => {
  const answer = await $.command.run({ command: 'clock', args: '' })
  expect(answer.text).toContain('Not built yet')
})
