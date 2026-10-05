import { expect, test } from 'claude-code/testing'

const PLUGIN = 'rostech-dashboard'
const PANE = {
  component: 'Pane',
  requestId: 'dashboard',
  props: { title: 'Dashboard', isFocused: true, bodyColumns: 80, placement: 'dock' },
} as const
const BAND = {
  component: 'AbovePrompt', requestId: 'main',
  props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 80 },
} as const

const ran = (stdout: string) => ({ exitCode: 0, stdout, stderr: '', isStdoutTruncated: false, isStderrTruncated: false })

for (const surface of ['terminal', 'desktop'] as const) {
  test(`${surface}: pressing High puts it on the next request, the model is left alone`, async ($, on) => {
    const sent: { model: string; effort: unknown }[] = []
    on('turn.step', async function* (_, e) {
      sent.push({ model: e.model, effort: e.effort })
      return { turnId: e.turnId, index: e.index, answer: '', toolUses: [] } as never
    })
    const ui = await $.ui.mount({ plugin: PLUGIN, surface, ...PANE } as never)
    await ui.press({ key: 'effort-high' })
    expect(await ui.find({ text: /· High/ })).toBeDefined()
    expect(await ui.find({ key: 'model-claude-opus-5-5' })).toBeUndefined()
    await ui.unmount()

    for await (const _ of $.turn.step({ turnId: 't', index: 0, model: 'claude-sonnet-5-5', messageCount: 1 } as never)) { /* drain */ }
    expect(sent[0]!.model).toBe('claude-sonnet-5-5')
    expect(sent[0]!.effort).toBe('high')
  })

  test(`${surface}: Auto leaves the request alone, Fast & Cheap sends helpers to Haiku`, async ($, on) => {
    const sent: { model: string; agent?: string }[] = []
    on('turn.step', async function* (_, e) {
      sent.push({ model: e.model, agent: e.agentId })
      return { turnId: e.turnId, index: e.index, answer: '', toolUses: [] } as never
    })
    const ui = await $.ui.mount({ plugin: PLUGIN, surface, ...PANE } as never)
    await ui.press({ key: 'helpers' })
    await ui.unmount()

    for await (const _ of $.turn.step({ turnId: 't', index: 0, model: 'claude-sonnet-5-5', messageCount: 1 } as never)) { /* drain */ }
    for await (const _ of $.turn.step({ turnId: 't', index: 0, model: 'claude-opus-5-5', messageCount: 1, agentId: 'a1' } as never)) { /* drain */ }
    expect(sent[0]!.model).toBe('claude-sonnet-5-5')
    expect(sent[1]!.model).toBe('claude-haiku-4-5-20251001')
  })

  test(`${surface}: each launch button sends its own prompt as if typed`,
    { options: { buttons: 'Review=review my last change; Tests=run the tests' } }, async ($, on) => {
      const typed: { text: string; asUser?: boolean }[] = []
      on('prompt.submit', (_, e) => { typed.push({ text: e.text, asUser: e.origin.kind === 'plugin' ? e.origin.asUser : undefined }); return { text: e.text } as never })
      const ui = await $.ui.mount({ plugin: PLUGIN, surface, ...PANE } as never)
      expect(await ui.find({ text: /Review/ })).toBeDefined()
      await ui.press({ key: 'launch-1' })
      await ui.unmount()
      expect(typed[0]!.text).toBe('run the tests')
      expect(typed[0]!.asUser).toBe(true)
    })
}

test('the button above the prompt is there and names the Dashboard', async ($, on) => {
  // Standing in for the engine: an empty band beneath.
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Box } = $.ui.resolve(e)
    return <Box />
  })
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', ...BAND } as never)
  expect(await ui.find({ key: 'dashboard' })).toBeDefined()
  await ui.unmount()
})

test('the button sits beside another plugin in the band, never over it', async ($, on) => {
  // Standing in for another plugin's band, beneath the Dashboard.
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text key="gauge">⛽ Week E ███░ F</Text>
  })
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', ...BAND } as never)
  expect(await ui.find({ key: 'dashboard' })).toBeDefined()
  expect(await ui.find({ text: /⛽ Week/ })).toBeDefined()
  await ui.unmount()
})

test('no gauges and no model picker in the panel', async $ => {
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', ...PANE } as never)
  expect(await ui.find({ text: /G A U G E S|% left|% full/ })).toBeUndefined()
  expect(await ui.find({ key: 'model-claude-opus-5-5' })).toBeUndefined()
  await ui.unmount()
})

test('out of the box: no status row, no launch buttons, and it says how to add them', async $ => {
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', ...PANE } as never)
  expect(await ui.find({ key: 'status' })).toBeUndefined()
  expect(await ui.find({ key: 'launch-0' })).toBeUndefined()
  expect(await ui.find({ text: /No buttons yet/ })).toBeDefined()
  await ui.unmount()
})

test('a status command that prints "n of m" shows the count under its label',
  { options: { statusLabel: 'QUEUE', statusCommand: 'node tools/count.js --short', statusFolder: '/work/repo' } }, async ($, on) => {
    const calls: { argv: readonly string[]; cwd?: string }[] = []
    on('ui.open', () => ({ value: { isPlaced: true } }) as never)
    on('process.run', (_, e) => {
      calls.push({ argv: e.argv, cwd: e.init?.cwd })
      return { value: ran('THE QUEUE\n  waiting : 2 of 6\n') } as never
    })
    const answer = await $.command.run({ command: 'dashboard', args: '' } as never)
    expect(answer.text).toBe('Dashboard opened. QUEUE: 2 of 6')
    const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', ...PANE } as never)
    expect(calls[0]!.argv).toEqual(['node', 'tools/count.js', '--short'])
    expect(calls[0]!.cwd).toBe('/work/repo')
    expect(await ui.find({ text: /QUEUE/ })).toBeDefined()
    expect(await ui.find({ text: /2 of 6/ })).toBeDefined()
    await ui.unmount()
  })

test('a status command with no count shows its first line; quotes keep a part whole',
  { options: { statusCommand: 'git log -1 "--format=%h %s"' } }, async ($, on) => {
    const calls: { argv: readonly string[]; cwd?: string }[] = []
    on('ui.open', () => ({ value: { isPlaced: true } }) as never)
    on('process.run', (_, e) => {
      calls.push({ argv: e.argv, cwd: e.init?.cwd })
      return { value: ran('\nabc1234 Fix the build\n') } as never
    })
    await $.command.run({ command: 'dashboard', args: '' } as never)
    const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', ...PANE } as never)
    expect(calls[0]!.argv).toEqual(['git', 'log', '-1', '--format=%h %s'])
    expect(calls[0]!.cwd).toBeUndefined()
    expect(await ui.find({ text: /STATUS/ })).toBeDefined()
    expect(await ui.find({ text: /abc1234 Fix the build/ })).toBeDefined()
    await ui.unmount()
  })

test('the status row runs nothing when no command is set', async ($, on) => {
  let runs = 0
  on('ui.open', () => ({ value: { isPlaced: true } }) as never)
  on('process.run', () => { runs++; return { value: ran('') } as never })
  const answer = await $.command.run({ command: 'dashboard', args: '' } as never)
  expect(answer.text).toBe('Dashboard opened.')
  expect(runs).toBe(0)
})
