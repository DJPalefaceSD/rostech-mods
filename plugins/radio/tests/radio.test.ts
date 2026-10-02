import { expect, mock, test } from 'claude-code/testing'

const played = { value: { exitCode: 0, stdout: '', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }

test('/radio off and on switch the chime', async $ => {
  expect((await $.command.run({ command: 'radio', args: 'off' })).text).toBe('Radio off.')
  expect((await $.command.run({ command: 'radio', args: '' })).text).toContain('Radio is off')
  expect((await $.command.run({ command: 'radio', args: 'on' })).text).toContain('Radio on')
})

test('/radio sound plays your own .wav once, keeps it, and hands the path over as a setting', async ($, on) => {
  mock.store(on)
  const seen: { argv: readonly string[]; env?: Record<string, string> }[] = []
  on('process.run', async (_, e) => {
    seen.push({ argv: e.argv, env: e.init?.env })
    return played as never
  })
  expect((await $.command.run({ command: 'radio', args: 'sound C:/sounds/ding.wav' })).text).toContain('Radio now plays C:/sounds/ding.wav')
  expect(seen[0].argv.join(' ')).not.toContain('ding.wav')
  expect(seen[0].env?.RADIO_FILE).toContain('ding.wav')
  expect((await $.command.run({ command: 'radio', args: '' })).text).toContain('It plays C:/sounds/ding.wav')
})

test('/radio sound refuses a file that is not a .wav, and default goes back', async ($, on) => {
  mock.store(on)
  expect((await $.command.run({ command: 'radio', args: 'sound C:/sounds/ding.mp3' })).text).toContain('has to be a .wav')
  expect((await $.command.run({ command: 'radio', args: 'sound default' })).text).toBe('Radio plays its own chime again.')
})

test('/radio sound says so when the file will not play', async ($, on) => {
  mock.store(on)
  on('process.run', async () => ({ value: { exitCode: 1, stdout: '', stderr: 'not found', isStdoutTruncated: false, isStderrTruncated: false } }))
  expect((await $.command.run({ command: 'radio', args: 'sound C:/sounds/gone.wav' })).text).toContain('Could not play')
})
