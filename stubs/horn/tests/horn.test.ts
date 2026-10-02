import { expect, test } from 'claude-code/testing'

test('/horn answers while it is a stub', async $ => {
  const answer = await $.command.run({ command: 'horn', args: '' })
  expect(answer.text).toContain('Not built yet')
})
