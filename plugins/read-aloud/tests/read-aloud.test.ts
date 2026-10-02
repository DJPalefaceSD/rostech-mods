import { expect, test } from 'claude-code/testing'

test('/read-aloud answers while it is a stub', async $ => {
  const answer = await $.command.run({ command: 'read-aloud', args: '' })
  expect(answer.text).toContain('Not built yet')
})
