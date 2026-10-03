import { expect, test } from 'claude-code/testing'

import { isFable, level, rollover, size, tokens, words } from '../hooks/register'

const usage = (model: string, n: number) => ({ model, input_tokens: n, output_tokens: n, cache_read_input_tokens: 999999, cache_creation_input_tokens: 0 })

test('a Fable response counts as Fable, any other does not', async () => {
  expect(isFable('claude-fable-5-1')).toBe(true)
  expect(isFable('claude-opus-5-5')).toBe(false)
})

test('cache reads are left out of the count', async () => {
  expect(tokens(usage('claude-fable-5-1', 100) as never)).toBe(200)
})

test("the level is Fable's share of the week's work", async () => {
  expect(level({ resetsAt: 'x', fable: 250, all: 1000 }, null)).toBe(25)
  expect(words({ resetsAt: 'x', fable: 1_200_000, all: 4_000_000 }, null)).toBe('Fable 1.2M tokens this week')
})

test("a window of Fable's own wins, read like Gas Gauge", async () => {
  expect(level({ resetsAt: 'x', fable: 1, all: 2 }, { kind: 'seven_day_fable', percentUsed: 40 })).toBe(60)
})

test('a later weekly refill starts a new week, the same one does not', async () => {
  const w = { resetsAt: '2026-10-05T19:00:00Z', fable: 10, all: 20 }
  expect(rollover(w, '2026-10-05T19:00:00Z')).toEqual(w)
  expect(rollover(w, '2026-10-12T19:00:00Z')).toEqual({ resetsAt: '2026-10-12T19:00:00Z', fable: 0, all: 0 })
  expect(rollover({ resetsAt: '', fable: 5, all: 9 }, '2026-10-12T19:00:00Z').fable).toBe(5)
})

test('sizes read short', async () => {
  expect(size(950)).toBe('950')
  expect(size(12_400)).toBe('12k')
})

test('/oil says so before the first reading', async $ => {
  const answer = await $.command.run({ command: 'oil', args: '' })
  expect(answer.text).toContain('No reading yet')
})

test('/oil hide keeps the number on the status line', async $ => {
  const answer = await $.command.run({ command: 'oil', args: 'hide' })
  expect(answer.text).toContain('Band hidden')
})
