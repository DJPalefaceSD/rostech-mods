import { test, expect } from 'claude-code/testing'
import { isFunctionKey, leftovers, pretty, rewrite, sendKey, withKey } from '../hooks/register'

type File = Parameters<typeof withKey>[0]

test('the hint names the key and says tap', () => {
  expect(rewrite('esc to interrupt · ctrl+x ctrl+s to send now', 'ctrl+x ctrl+x')).toBe(
    'esc to interrupt · tap Ctrl+X Ctrl+X to send now',
  )
  expect(rewrite('ctrl+enter to send now', 'ctrl+x ctrl+x')).toBe('tap Ctrl+X Ctrl+X to send now')
  expect(rewrite('? for shortcuts', 'ctrl+x ctrl+x')).toBe('? for shortcuts')
})

test('the key is read off the file, and an F-key never counts', () => {
  expect(sendKey(null)).toBe('ctrl+x ctrl+s')
  expect(sendKey({ bindings: [{ context: 'Chat', bindings: { 'ctrl+x ctrl+x': 'chat:sendNow' } }] })).toBe('ctrl+x ctrl+x')
  expect(sendKey({ bindings: [{ context: 'Chat', bindings: { f5: 'chat:sendNow' } }] })).toBe('ctrl+x ctrl+s')
  expect(pretty('ctrl+x ctrl+x')).toBe('Ctrl+X Ctrl+X')
  expect(pretty('f5')).toBe('F5')
})

test('setting the key keeps every other binding and leaves the default on', () => {
  const out = withKey({ bindings: [{ context: 'Global', bindings: { 'ctrl+t': null } }] })
  expect(out.bindings[0].bindings['ctrl+t']).toBe(null)
  const chat = out.bindings.find(b => b.context === 'Chat')!
  expect(chat.bindings['ctrl+x ctrl+x']).toBe('chat:sendNow')
  expect('ctrl+x ctrl+s' in chat.bindings).toBe(false)
})

test('the lines an older version left are taken out, and nothing else', () => {
  const old: File = {
    bindings: [
      { context: 'Chat', bindings: { 'ctrl+x ctrl+s': null, f5: 'chat:sendNow', 'ctrl+g': 'chat:externalEditor' } },
      { context: 'Global', bindings: { 'ctrl+t': null } },
    ],
  }
  expect(leftovers(old)).toEqual(['f5', 'ctrl+x ctrl+s'])
  const out = withKey(old)
  const chat = out.bindings.find(b => b.context === 'Chat')!
  expect(chat.bindings).toEqual({ 'ctrl+g': 'chat:externalEditor', 'ctrl+x ctrl+x': 'chat:sendNow' })
  expect(out.bindings[1].bindings).toEqual({ 'ctrl+t': null })
  expect(leftovers(out)).toEqual([])
  // F5 bound to something else is the person's own line, and stays.
  const own = withKey({ bindings: [{ context: 'Chat', bindings: { f5: 'chat:submit' } }] })
  expect(own.bindings[0].bindings.f5).toBe('chat:submit')
})

// 🔴 The fault this version fixes: never write an F-key, never switch off a default.
test('it never writes an F-key or a null for a default chord', () => {
  const inputs: File[] = [
    null,
    { bindings: [] },
    { bindings: [{ context: 'Global', bindings: { 'ctrl+t': null } }] },
    { bindings: [{ context: 'Chat', bindings: { 'ctrl+x ctrl+s': null, f5: 'chat:sendNow' } }] },
    { bindings: [{ context: 'Chat', bindings: { 'ctrl+x ctrl+x': 'chat:sendNow' } }] },
  ]
  for (const input of inputs) {
    const before = new Set(
      (input?.bindings ?? []).flatMap(b => Object.keys(b.bindings).map(k => `${b.context}|${k}|${b.bindings[k]}`)),
    )
    for (const block of withKey(input).bindings) {
      for (const [k, v] of Object.entries(block.bindings)) {
        const line = `${block.context}|${k}|${v}`
        if (before.has(line)) continue
        // Anything new is ours: it must not be an F-key and must not be a null.
        expect(isFunctionKey(k)).toBe(false)
        expect(v).not.toBe(null)
      }
      expect(block.context === 'Chat' && block.bindings['ctrl+x ctrl+s'] === null).toBe(false)
      expect(block.context === 'Chat' && block.bindings.f5 === 'chat:sendNow').toBe(false)
    }
  }
  expect(isFunctionKey('f5')).toBe(true)
  expect(isFunctionKey('shift+f12')).toBe(true)
  expect(isFunctionKey('ctrl+x ctrl+x')).toBe(false)
})
