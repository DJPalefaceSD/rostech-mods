import { expect, mock, test } from 'claude-code/testing'

const usage = (input: number, output: number) => ({
  input_tokens: input,
  output_tokens: output,
  cache_read_input_tokens: 900000,
  cache_creation_input_tokens: 0,
  model: 'claude-opus-5-5',
})

async function turn($: Parameters<Parameters<typeof test>[1]>[0], input: number, output: number) {
  await $.turn.complete({ answer: 'done', durationMs: 1000, isAborted: false, turnId: 't', reason: 'answer', usage: usage(input, output) } as never)
}

test('/tach reads fresh tokens a minute over the window and leaves cache reads out', async ($, on) => {
  mock.store(on)
  const clock = mock.clock(on, { now: 10 * 60_000 })
  on('turn.complete', (_, e) => ({ text: e.answer }) as never)
  await turn($, 4000, 1000)
  await clock.advance(60_000)
  await turn($, 4000, 1000)
  expect((await $.command.run({ command: 'tach', args: '' })).text).toBe('⚙️ 2.0k tokens a minute over the last 5m. Your busiest: 2.0k a minute.')
})

test('an old turn falls out of the window', async ($, on) => {
  mock.store(on)
  const clock = mock.clock(on, { now: 10 * 60_000 })
  on('turn.complete', (_, e) => ({ text: e.answer }) as never)
  await turn($, 9000, 1000)
  await clock.advance(6 * 60_000)
  expect((await $.command.run({ command: 'tach', args: '' })).text).toContain('⚙️ 0 tokens a minute')
})

test('/tach 1h sets the window and keeps it', async ($, on) => {
  mock.store(on)
  mock.clock(on, { now: 0 })
  expect((await $.command.run({ command: 'tach', args: '1h' })).text).toBe('Tach now reads the last 1h.')
  expect((await $.command.run({ command: 'tach', args: '' })).text).toContain('over the last 1h')
})

test('/tach refuses a window it cannot read', async ($, on) => {
  mock.store(on)
  expect((await $.command.run({ command: 'tach', args: 'soon' })).text).toContain('minutes or hours')
})
