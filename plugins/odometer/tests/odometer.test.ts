import { expect, test } from 'claude-code/testing'

test('/odometer answers while it is a stub', async $ => {
  const answer = await $.command.run({ command: 'odometer', args: '' })
  expect(answer.text).toContain('Not built yet')
})
