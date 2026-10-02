import { expect, mock, test } from 'claude-code/testing'

test('/odometer reads the miles and the cost the engine measured', async ($, on) => {
  const clock = mock.clock(on, { now: 0 })
  on('session.measure', (_, e) => ({ changed: e.changed }))
  await $.session.measure({ context: { window: 200000 }, rateLimits: [], cost: { usd: 3.1 }, changed: ['cost'] } as never)
  await clock.advance(83 * 60_000)
  const answer = await $.command.run({ command: 'odometer', args: '' })
  expect(answer.text).toBe('🧭 1h 23m  $3.10')
})

test('/odometer hide hides the band', async $ => {
  expect((await $.command.run({ command: 'odometer', args: 'hide' })).text).toBe('Odometer hidden.')
})
