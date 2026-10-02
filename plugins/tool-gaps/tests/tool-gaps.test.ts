import { expect, test } from 'claude-code/testing'

test('/tool-gaps answers while it is a stub', async $ => {
  const answer = await $.command.run({ command: 'tool-gaps', args: '' })
  expect(answer.text).toContain('Not built yet')
})
