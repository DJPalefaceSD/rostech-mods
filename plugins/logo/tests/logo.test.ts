import { expect, mock, test } from 'claude-code/testing'

// The script prints width, height, then the pixels. 144 pixels, 12 by 12: the
// top half pink, the bottom half see-through.
const PIXELS = Array.from({ length: 144 }, (_, i) => (i < 72 ? 'C285A2FF' : '00000000')).join(' ')
const ran = (stdout: string) => ({ value: { exitCode: 0, stdout, stderr: '', isStdoutTruncated: false, isStderrTruncated: false } })
const shrunk = ran('12 12 ' + PIXELS + '\r\n')

test('/logo set shrinks a PNG to cells and /logo reads it back', async ($, on) => {
  mock.store(on)
  on('process.run', async () => shrunk)
  expect((await $.command.run({ command: 'logo', args: 'set C:/brand/mark.png' })).text).toBe('Logo set: C:/brand/mark.png, 12 columns by 6 rows.')
  expect((await $.command.run({ command: 'logo', args: '' })).text).toBe('Logo: C:/brand/mark.png')
})

test('the path goes to PowerShell as an environment value, not on the command line', async ($, on) => {
  mock.store(on)
  const seen: { argv: readonly string[]; env?: Record<string, string> }[] = []
  on('process.run', async (_, e) => {
    seen.push({ argv: e.argv, env: e.init?.env })
    return shrunk as never
  })
  await $.command.run({ command: 'logo', args: 'set C:/brand/mark.png' })
  expect(seen[0].env?.LOGO_FILE).toBe('C:/brand/mark.png')
  expect(seen[0].argv.join(' ')).not.toContain('mark.png')
})

test('/logo set refuses a file that is not a PNG', async ($, on) => {
  mock.store(on)
  expect((await $.command.run({ command: 'logo', args: 'set C:/brand/mark.jpg' })).text).toContain('has to be a PNG')
})

test('/logo set says so when the PNG cannot be read', async ($, on) => {
  mock.store(on)
  on('process.run', async () => ({ value: { exitCode: 1, stdout: '', stderr: 'not found', isStdoutTruncated: false, isStderrTruncated: false } }))
  expect((await $.command.run({ command: 'logo', args: 'set C:/brand/gone.png' })).text).toContain('Could not read')
  expect((await $.command.run({ command: 'logo', args: '' })).text).toContain('No logo yet')
})

test('a PNG drawn small keeps its own size on the dash, two pixels to a cell', async ($, on) => {
  mock.store(on)
  const small = Array.from({ length: 16 * 16 }, () => 'C184A1FF').join(' ')
  on('process.run', async () => ran('16 16 ' + small))
  expect((await $.command.run({ command: 'logo', args: 'set C:/brand/mark-16px.png' })).text).toBe('Logo set: C:/brand/mark-16px.png, 16 columns by 8 rows.')
})

test('a picture that does not add up is refused, not drawn wrong', async ($, on) => {
  mock.store(on)
  on('process.run', async () => ran('16 16 C184A1FF'))
  expect((await $.command.run({ command: 'logo', args: 'set C:/brand/mark.png' })).text).toContain('Could not read')
})
