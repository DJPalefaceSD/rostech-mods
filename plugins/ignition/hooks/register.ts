import type { Register } from 'claude-code'

// 🔑 IGNITION — one key to send now. Ryan, 3 Oct 2026: "i rewally dislike ctrl x + ctrl s
// to send" · "I want it to say tap ESC to send now" · "if it doesnt work for everyoine we
// cant use it". He picked F5; ESC stayed the stop button.
//
// A mod cannot bind keys. The key lives in each person's own ~/.claude/keybindings.json,
// so /ignition writes F5 there, merged, and LEAVES the default chord on as the fallback
// for a terminal that never sends F5. The hint names whatever key the file says now,
// read off the file, never typed here.

const ACTION = 'chat:sendNow'
const KEY = 'f5'
const DEFAULT_CHORD = 'ctrl+x ctrl+s'

type Block = { context: string; bindings: Record<string, string | null> }
type File = { $schema?: string; $docs?: string; bindings: Block[] }

// "ctrl+x ctrl+s" → "Ctrl+X Ctrl+S", "f5" → "F5"
export function pretty(chord: string): string {
  return chord
    .split(' ')
    .map(stroke => stroke.split('+').map(p => (p.length <= 3 ? p.toUpperCase() : p[0].toUpperCase() + p.slice(1))).join('+'))
    .join(' ')
}

// The key that sends now: the first one the file binds to the action, else the default
// chord unless the file switched it off.
export function sendKey(file: File | null): string | null {
  let defaultOff = false
  for (const block of file?.bindings ?? []) {
    if (block.context !== 'Chat') continue
    for (const [key, action] of Object.entries(block.bindings)) {
      if (action === ACTION) return key
      if (key === DEFAULT_CHORD && action === null) defaultOff = true
    }
  }
  return defaultOff ? 'ctrl+enter' : DEFAULT_CHORD
}

// "… · ctrl+x ctrl+s to send now · …" → "… · tap F5 to send now · …"
export function rewrite(hint: string, key: string): string {
  return hint.replace(/(?:[^\s·]+\s){0,2}to send now/i, `tap ${pretty(key)} to send now`)
}

// Adds F5 to the Chat block. Merges: every other binding stays as the person had it.
export function withF5(file: File | null): File {
  const out: File = file
    ? { ...file, bindings: file.bindings.map(b => ({ ...b, bindings: { ...b.bindings } })) }
    : {
        $schema: 'https://www.schemastore.org/claude-code-keybindings.json',
        $docs: 'https://code.claude.com/docs/en/keybindings',
        bindings: [],
      }
  let chat = out.bindings.find(b => b.context === 'Chat')
  if (!chat) {
    chat = { context: 'Chat', bindings: {} }
    out.bindings.push(chat)
  }
  chat.bindings[KEY] = ACTION
  return out
}

export function parse(text: string | null): File | null {
  if (text === null) return null
  try {
    return JSON.parse(text) as File
  } catch {
    return null
  }
}

export const register: Register = on => {
  let key: string = DEFAULT_CHORD

  on('session.start', async ($, e, next) => {
    const home = (await $.env.get('USERPROFILE')) || (await $.env.get('HOME')) || ''
    const path = `${home}/.claude/keybindings.json`
    const text = (await $.fs.exists(path)) ? await $.fs.read(path) : null
    key = sendKey(parse(text)) ?? DEFAULT_CHORD
    $.command.register({ name: 'ignition', description: 'Set F5 to send a waiting message now' })
    return next(e)
  })

  on('command.run', { name: 'ignition' }, async $ => {
    const home = (await $.env.get('USERPROFILE')) || (await $.env.get('HOME')) || ''
    const path = `${home}/.claude/keybindings.json`
    const before = parse((await $.fs.exists(path)) ? await $.fs.read(path) : null)
    if (sendKey(before) === KEY) {
      key = KEY
      return { text: `F5 already sends now. Nothing changed. (${path})` }
    }
    await $.fs.write(path, JSON.stringify(withF5(before), null, 2) + '\n')
    key = KEY
    return { text: `F5 now sends a waiting message right away. Ctrl+X Ctrl+S still works too, for terminals that never send F5. (${path})` }
  })

  on('ui.render', { component: 'PromptHint' }, ($, e, next) => {
    if (!/send now/i.test(e.props.hint)) return next(e)
    return next({ ...e, props: { ...e.props, hint: rewrite(e.props.hint, key) } })
  })
}
