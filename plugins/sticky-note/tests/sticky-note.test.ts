import { expect, test } from 'claude-code/testing'

test('/sticky-note answers while it is a stub', async $ => {
  const answer = await $.command.run({ command: 'sticky-note', args: '' })
  expect(answer.text).toContain('Not built yet')
})
