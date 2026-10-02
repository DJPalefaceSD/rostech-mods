import { expect, test } from 'claude-code/testing'

test('/memory-trim answers while it is a stub', async $ => {
  const answer = await $.command.run({ command: 'memory-trim', args: '' })
  expect(answer.text).toContain('Not built yet')
})
