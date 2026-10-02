import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

// Paths you have marked as yours. $.store keeps them across sessions.
const paths = atom({ plugin: 'hands-off', key: 'paths' } as const, [] as string[])

function slashes(p: string): string {
  return p.split(String.fromCharCode(92)).join("/")
}

// One spelling for every path: forward slashes, no trailing slash, lower case,
// and relative paths read from the project root.
async function norm($: EngineInterface, p: string): Promise<string> {
  let s = slashes(p.trim()).replace(/[/]+$/, '')
  const isAbsolute = /^[a-zA-Z]:/.test(s) || s.startsWith('/')
  if (!isAbsolute) s = `${slashes(await $.session.root())}/${s.startsWith('./') ? s.slice(2) : s}`
  return s.toLowerCase()
}

async function save($: EngineInterface, next: string[]) {
  await $.store.set('paths', next)
  await update($, paths, () => next)
}

// A file is held when it is a marked path or sits inside a marked folder.
function holder(file: string, held: string[]): string | undefined {
  return held.find(h => file === h || file.startsWith(h + '/'))
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'hands-off', description: 'Mark files Claude may not edit. /hands-off <path>, /hands-off list, /hands-off release <path>.' })
    const kept = await $.store.get('paths')
    await update($, paths, () => (Array.isArray(kept) ? (kept as string[]) : []))
    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    const target = e.tool === 'Edit' || e.tool === 'Write' ? e.file_path : e.tool === 'NotebookEdit' ? e.notebook_path : undefined
    if (target) {
      const held = holder(await norm($, target), await read($, paths))
      if (held) return { deny: `hands-off: ${target} is marked hands-off by the user. Ask them to release it with /hands-off release before editing it.` }
    }
    return next(e)
  })

  on('command.run', { command: 'hands-off' }, async ($, e) => {
    const [verb, ...rest] = e.args.trim().split(/\s+/)
    const arg = rest.join(' ')
    const held = await read($, paths)
    if (!verb || verb === 'list') {
      return { text: held.length ? `✋ Hands off:\n${held.join('\n')}` : 'Nothing is marked. /hands-off <path> marks a file or folder.' }
    }
    if (verb === 'release') {
      if (arg === 'all') { await save($, []); return { text: 'Everything released.' } }
      const p = await norm($, arg)
      // Forgiving: "notes md" or "notesmd" still finds notes.md, by letters and digits alone.
      const loose = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
      const want = loose(arg)
      const match = held.includes(p) ? p : held.find(h => loose(h.split('/').pop() ?? '') === want || loose(h).endsWith(want))
      if (!match) {
        return { text: held.length ? `${arg} is not marked. Marked now:\n${held.join('\n')}` : `${arg} is not marked. Nothing is marked.` }
      }
      await save($, held.filter(h => h !== match))
      return { text: `Released: ${match}` }
    }
    const p = await norm($, e.args)
    if (!held.includes(p)) await save($, [...held, p])
    return { text: `✋ Hands off: ${e.args.trim()}. Claude cannot edit it until you release it.` }
  })
}
