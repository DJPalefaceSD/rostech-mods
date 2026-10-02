import { expect, test } from 'claude-code/testing'

test('/page-pile answers while it is a stub', async $ => {
  const answer = await $.command.run({ command: 'page-pile', args: '' })
  expect(answer.text).toContain('Not built yet')
})
