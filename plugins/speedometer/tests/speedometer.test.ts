import { expect, test } from 'claude-code/testing'

const reading = (percent: number) => ({
  context: { window: 200000, percent },
  rateLimits: [],
  changed: ['context'],
})

test('/speed reads the fill the engine measured', async ($, on) => {
  on('session.measure', (_, e) => ({ changed: e.changed }))
  on('ui.toast', async () => {})
  await $.session.measure(reading(50) as never)
  const answer = await $.command.run({ command: 'speed', args: '' })
  expect(answer.text).toContain('context  0 ███ ½ ░░░ MAX  50% full')
})

test('/speed warns once when the context redlines', async ($, on) => {
  const toasts: string[] = []
  on('session.measure', (_, e) => ({ changed: e.changed }))
  on('ui.toast', async (_, e) => { toasts.push(e.text) })
  await $.session.measure(reading(70) as never)
  await $.session.measure(reading(88) as never)
  await $.session.measure(reading(92) as never)
  expect(toasts.length).toBe(1)
})

test('/speed says so before the first reading', async $ => {
  const answer = await $.command.run({ command: 'speed', args: '' })
  expect(answer.text).toContain('No reading yet')
})

test('/speedometer answers the same as /speed', async $ => {
  const answer = await $.command.run({ command: 'speedometer', args: '' })
  expect(answer.text).toContain('No reading yet')
})
