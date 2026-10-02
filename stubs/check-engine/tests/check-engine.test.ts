import { expect, test } from 'claude-code/testing'

test('/check-engine answers while it is a stub', async $ => {
  const answer = await $.command.run({ command: 'check-engine', args: '' })
  expect(answer.text).toContain('Not built yet')
})
