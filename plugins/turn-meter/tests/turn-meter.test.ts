import { expect, test } from 'claude-code/testing'

test('/turn-meter answers while it is a stub', async $ => {
  const answer = await $.command.run({ command: 'turn-meter', args: '' })
  expect(answer.text).toContain('Not built yet')
})
