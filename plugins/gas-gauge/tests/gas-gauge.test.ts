import { expect, test } from 'claude-code/testing'

const reading = (fiveUsed: number, weekUsed: number) => ({
  context: { size: 200000 },
  rateLimits: [
    { kind: 'five_hour', percentUsed: fiveUsed },
    { kind: 'seven_day', percentUsed: weekUsed },
  ],
  changed: ['rateLimits'],
})

test('/gas reads the tanks the engine measured', async ($, on) => {
  on('session.measure', (_, e) => ({ changed: e.changed }))
  on('ui.status', async () => {})
  on('ui.toast', async () => {})
  await $.session.measure(reading(29, 72) as never)
  const answer = await $.command.run({ command: 'gas', args: '' })
  expect(answer.text).toContain('5-hour  E ███ ½ █░░ F  71% left')
  expect(answer.text).toContain('week  E ██░ ½ ░░░ F  28% left')
})

test('/gas says so before the first reading', async $ => {
  const answer = await $.command.run({ command: 'gas', args: '' })
  expect(answer.text).toContain('No reading yet')
})

test('/gas warns once when a tank drops past 25% left', async ($, on) => {
  const toasts: string[] = []
  on('session.measure', (_, e) => ({ changed: e.changed }))
  on('ui.status', async () => {})
  on('ui.toast', async (_, e) => { toasts.push(e.text) })
  await $.session.measure(reading(70, 10) as never)
  await $.session.measure(reading(80, 10) as never)
  await $.session.measure(reading(85, 10) as never)
  expect(toasts.length).toBe(1)
})

test('/gas hide keeps the numbers on the status line', async $ => {
  const answer = await $.command.run({ command: 'gas', args: 'hide' })
  expect(answer.text).toContain('Band hidden')
})
