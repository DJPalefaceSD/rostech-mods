import { expect, test } from 'claude-code/testing'

test('/drop-folder answers while it is a stub', async $ => {
  const answer = await $.command.run({ command: 'drop-folder', args: '' })
  expect(answer.text).toContain('Not built yet')
})
