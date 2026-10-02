import { expect, test } from 'claude-code/testing'

test('/record answers while it is a stub', async $ => {
  const answer = await $.command.run({ command: 'record', args: '' })
  expect(answer.text).toContain('Not built yet')
})
