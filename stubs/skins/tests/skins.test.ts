import { expect, test } from 'claude-code/testing'

test('/skins answers while it is a stub', async $ => {
  const answer = await $.command.run({ command: 'skins', args: '' })
  expect(answer.text).toContain('Not built yet')
})
