import { expect, mock, test } from 'claude-code/testing'

test('/logo set keeps a PNG and /logo reads it back', async ($, on) => {
  mock.store(on)
  expect((await $.command.run({ command: 'logo', args: 'set C:/brand/mark.png' })).text).toBe('Logo set: C:/brand/mark.png')
  expect((await $.command.run({ command: 'logo', args: '' })).text).toBe('Logo: C:/brand/mark.png')
})

test('/logo set refuses a file that is not a PNG', async ($, on) => {
  mock.store(on)
  expect((await $.command.run({ command: 'logo', args: 'set C:/brand/mark.jpg' })).text).toContain('has to be a PNG')
})
