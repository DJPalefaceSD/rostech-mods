import { expect, test } from 'claude-code/testing'

test('/on-camera answers while it is a stub', async $ => {
  const answer = await $.command.run({ command: 'on-camera', args: '' })
  expect(answer.text).toContain('Not built yet')
})
