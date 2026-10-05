import type { Register } from 'claude-code'

// 📯 HORN — one chord to send now. Renamed from Ignition, his words, 4 Oct 2026: "i want to
// change ignition to 'Horn' because when I bash F5 its like im honking the horn".
//
// Why not F5 any more: Claude Code's keybindings only take letters, digits and the named
// special keys (https://code.claude.com/docs/en/keybindings). F5 is not one, so the binding
// was skipped without a word. His words: "F5 never works. Tapping ESC is the only thing that
// works". He picked Ctrl+X Ctrl+X: "can we do ctrl x ctrl x" → "seems to work". It is not a
// default chord in the Chat context, so binding it takes nothing away.
//
// A mod cannot bind keys. The key lives in each person's own ~/.claude/keybindings.json,
// so /horn writes the chord there, merged. It never switches off a default. It also takes
// back the two lines an older version could have left behind: F5 → send now, and the
// default Ctrl+X Ctrl+S switched off. Every other line stays as the person had it.
// The hint names whatever key the file says now, read off the file, never typed here.

const ACTION = 'chat:sendNow'
const KEY = 'ctrl+x ctrl+x'
const DEFAULT_CHORD = 'ctrl+x ctrl+s'
const NAME = 'horn'

type Block = { context: string; bindings: Record<string, string | null> }
type File = { $schema?: string; $docs?: string; bindings: Block[] }

// A function key: "f5", "shift+f5". Claude Code does not take these.
export function isFunctionKey(chord: string): boolean {
  return chord.split(' ').some(stroke => /^f\d+$/i.test(stroke.split('+').pop() ?? ''))
}

// "ctrl+x ctrl+s" → "Ctrl+X Ctrl+S", "f5" → "F5", "alt+enter" → "Alt+Enter"
export function pretty(chord: string): string {
  const part = (p: string): string =>
    p.length === 1 || /^f\d+$/.test(p) ? p.toUpperCase() : p[0].toUpperCase() + p.slice(1)
  return chord
    .split(' ')
    .map(stroke => stroke.split('+').map(part).join('+'))
    .join(' ')
}

// The key that sends now: the first one the file binds to the action that can actually fire
// (never a function key), else the default chord unless the file switched it off.
export function sendKey(file: File | null): string | null {
  let defaultOff = false
  for (const block of file?.bindings ?? []) {
    if (block.context !== 'Chat') continue
    for (const [key, action] of Object.entries(block.bindings)) {
      if (action === ACTION && !isFunctionKey(key)) return key
      if (key === DEFAULT_CHORD && action === null) defaultOff = true
    }
  }
  return defaultOff ? 'ctrl+enter' : DEFAULT_CHORD
}

// The lines an older version wrote that must come back out: F5 → send now, and the default
// chord switched off. Only those two, only in the Chat block.
export function leftovers(file: File | null): string[] {
  const chat = file?.bindings?.find(b => b.context === 'Chat')
  if (!chat) return []
  const out: string[] = []
  if (chat.bindings.f5 === ACTION) out.push('f5')
  if (DEFAULT_CHORD in chat.bindings && chat.bindings[DEFAULT_CHORD] === null) out.push(DEFAULT_CHORD)
  return out
}

// "… · ctrl+x ctrl+s to send now · …" → "… · tap Ctrl+X Ctrl+X to send now · …"
export function rewrite(hint: string, key: string): string {
  return hint.replace(/(?:[^\s·]+\s){0,2}to send now/i, `tap ${pretty(key)} to send now`)
}

// Adds the chord to the Chat block and takes the leftovers out. Merges: every other binding
// stays as the person had it.
export function withKey(file: File | null): File {
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
  for (const key of leftovers(out)) delete chat.bindings[key]
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
    await $.command.register({ name: NAME, description: 'Set Ctrl+X Ctrl+X to send a waiting message now' })
    return next(e)
  })

  on('command.run', { command: NAME }, async ($, e) => {
    const home = (await $.env.get('USERPROFILE')) || (await $.env.get('HOME')) || ''
    const path = `${home}/.claude/keybindings.json`
    const before = parse((await $.fs.exists(path)) ? await $.fs.read(path) : null)
    const old = leftovers(before)
    if (sendKey(before) === KEY && old.length === 0) {
      key = KEY
      return { text: `Ctrl+X Ctrl+X already sends now. Nothing changed. (${path})` }
    }
    await $.fs.write(path, JSON.stringify(withKey(before), null, 2) + '\n')
    key = KEY
    const fixed = old.length ? ` Took out what an older version left: ${old.map(pretty).join(', ')}.` : ''
    return { text: `Ctrl+X Ctrl+X now sends a waiting message right away. Ctrl+X Ctrl+S still works too.${fixed} (${path})` }
  })

  on('ui.render', { component: 'PromptHint' }, ($, e, next) => {
    if (!/send now/i.test(e.props.hint)) return next(e)
    return next({ ...e, props: { ...e.props, hint: rewrite(e.props.hint, key) } })
  })
}
