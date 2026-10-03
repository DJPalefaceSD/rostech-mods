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

test('set to week, the 5-hour tank is gone from /gas', { options: { tanks: 'week' } }, async ($, on) => {
  on('session.measure', (_, e) => ({ changed: e.changed }))
  on('ui.status', async () => {})
  on('ui.toast', async () => {})
  await $.session.measure(reading(29, 72) as never)
  const answer = await $.command.run({ command: 'gas', args: '' })
  expect(answer.text).toContain('week  E ██░ ½ ░░░ F  28% left')
  expect(answer.text).not.toContain('5-hour')
})

test('set to 5-hour, the week tank is gone and never warns', { options: { tanks: '5-hour' } }, async ($, on) => {
  const toasts: string[] = []
  on('session.measure', (_, e) => ({ changed: e.changed }))
  on('ui.status', async () => {})
  on('ui.toast', async (_, e) => { toasts.push(e.text) })
  await $.session.measure(reading(10, 70) as never)
  await $.session.measure(reading(10, 80) as never)
  const answer = await $.command.run({ command: 'gas', args: '' })
  expect(answer.text).toContain('5-hour')
  expect(answer.text).not.toContain('week')
  expect(toasts.length).toBe(0)
})
