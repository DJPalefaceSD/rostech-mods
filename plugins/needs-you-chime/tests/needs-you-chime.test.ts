import { expect, test } from 'claude-code/testing'

test('/needs-you-chime answers while it is a stub', async $ => {
  const answer = await $.command.run({ command: 'needs-you-chime', args: '' })
  expect(answer.text).toContain('Not built yet')
})
