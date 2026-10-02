import { expect, test } from 'claude-code/testing'

test('/perm-audit answers while it is a stub', async $ => {
  const answer = await $.command.run({ command: 'perm-audit', args: '' })
  expect(answer.text).toContain('Not built yet')
})
