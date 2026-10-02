import { expect, test } from 'claude-code/testing'

const reading = (percent: number) => ({
  context: { window: 200000, percent },
  rateLimits: [],
  changed: ['context'],
})

test('/limit reads the fill the engine measured', async ($, on) => {
  on('session.measure', (_, e) => ({ changed: e.changed }))
  on('ui.toast', async () => {})
  await $.session.measure(reading(50) as never)
  const answer = await $.command.run({ command: 'limit', args: '' })
  expect(answer.text).toContain('context  C ██████ ½ ░░░░░░ H  50% full')
})

test('/limit warns once when the context runs hot', async ($, on) => {
  const toasts: string[] = []
  on('session.measure', (_, e) => ({ changed: e.changed }))
  on('ui.toast', async (_, e) => { toasts.push(e.text) })
  await $.session.measure(reading(70) as never)
  await $.session.measure(reading(88) as never)
  await $.session.measure(reading(92) as never)
  expect(toasts.length).toBe(1)
})

test('/limit says so before the first reading', async $ => {
  const answer = await $.command.run({ command: 'limit', args: '' })
  expect(answer.text).toContain('No reading yet')
})
