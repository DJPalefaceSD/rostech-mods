import { expect, test } from 'claude-code/testing'

test('/leak-guard answers while it is a stub', async $ => {
  const answer = await $.command.run({ command: 'leak-guard', args: '' })
  expect(answer.text).toContain('Not built yet')
})
