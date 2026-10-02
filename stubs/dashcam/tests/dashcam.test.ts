import { expect, test } from 'claude-code/testing'

test('/dashcam answers while it is a stub', async $ => {
  const answer = await $.command.run({ command: 'dashcam', args: '' })
  expect(answer.text).toContain('Not built yet')
})
