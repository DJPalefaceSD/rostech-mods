import { expect, test } from 'claude-code/testing'

test('/seatbelt answers while it is a stub', async $ => {
  const answer = await $.command.run({ command: 'seatbelt', args: '' })
  expect(answer.text).toContain('Not built yet')
})
