import { expect, test } from 'claude-code/testing'

test('/gps answers while it is a stub', async $ => {
  const answer = await $.command.run({ command: 'gps', args: '' })
  expect(answer.text).toContain('Not built yet')
})
