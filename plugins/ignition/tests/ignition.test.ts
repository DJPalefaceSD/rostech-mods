import { test, expect } from 'claude-code/testing'
import { pretty, rewrite, sendKey, withF5 } from '../hooks/register'

test('the hint names the key and says tap', () => {
  expect(rewrite('esc to interrupt · ctrl+x ctrl+s to send now', 'f5')).toBe('esc to interrupt · tap F5 to send now')
  expect(rewrite('ctrl+enter to send now', 'f5')).toBe('tap F5 to send now')
  expect(rewrite('? for shortcuts', 'f5')).toBe('? for shortcuts')
})

test('the key is read off the file', () => {
  expect(sendKey(null)).toBe('ctrl+x ctrl+s')
  expect(sendKey({ bindings: [{ context: 'Chat', bindings: { 'ctrl+x ctrl+s': null, f5: 'chat:sendNow' } }] })).toBe('f5')
  expect(pretty('ctrl+x ctrl+s')).toBe('CTRL+X CTRL+S'.replace(/CTRL/g, 'Ctrl'))
})

test('setting F5 keeps every other binding and leaves the default on', () => {
  const out = withF5({ bindings: [{ context: 'Global', bindings: { 'ctrl+t': null } }] })
  expect(out.bindings[0].bindings['ctrl+t']).toBe(null)
  const chat = out.bindings.find(b => b.context === 'Chat')!
  expect(chat.bindings.f5).toBe('chat:sendNow')
  expect('ctrl+x ctrl+s' in chat.bindings).toBe(false)
})
