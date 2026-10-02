import { expect, test } from 'claude-code/testing'

test('/radio off and on switch the chime', async $ => {
  expect((await $.command.run({ command: 'radio', args: 'off' })).text).toBe('Radio off.')
  expect((await $.command.run({ command: 'radio', args: '' })).text).toContain('Radio is off')
  expect((await $.command.run({ command: 'radio', args: 'on' })).text).toContain('Radio on')
})
