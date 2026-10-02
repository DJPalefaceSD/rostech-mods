import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

// The PNG on the dash, by absolute path. $.store keeps it across sessions.
const file = atom({ plugin: 'logo', key: 'file' } as const, '')
const isHidden = atom({ plugin: 'logo', key: 'isHidden' } as const, false)

// Two rows tall, which is the height of a two-line gauge beside it.
const ROWS = 2
const COLUMNS = 5

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'logo', description: 'Put your logo on the dash. /logo set <path to a PNG>, /logo hide, /logo show.' })
    const kept = await $.store.get('file')
    await update($, file, () => (typeof kept === 'string' ? kept : ''))
    return next(e)
  })

  on('command.run', { command: 'logo' }, async ($, e) => {
    const [verb, ...rest] = e.args.trim().split(/\s+/)
    if (verb === 'hide' || verb === 'show') {
      await update($, isHidden, () => verb === 'hide')
      return { text: verb === 'hide' ? 'Logo hidden.' : 'Logo showing.' }
    }
    if (verb === 'set') {
      const path = rest.join(' ').replace(/^"|"$/g, '')
      if (!/\.png$/i.test(path)) return { text: 'The logo has to be a PNG file. /logo set C:/path/to/logo.png' }
      await $.store.set('file', path)
      await update($, file, () => path)
      return { text: `Logo set: ${path}` }
    }
    const now = await read($, file)
    return { text: now ? `Logo: ${now}` : 'No logo yet. /logo set <path to a PNG> puts one on the dash.' }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const path = await read($, file)
    if (e.props.hasSurvey || !path || e.surface !== 'terminal' || (await read($, isHidden))) return next(e)

    const { Box, Image } = $.ui.resolve(e)
    // Ours, then every other band above the prompt draws beside it.
    const below = await next(e)
    return (
      <Box flexDirection="row">
        <Box marginLeft={1} marginRight={2}>
          <Image source={{ file: path, format: 'png' }} columns={COLUMNS} rows={ROWS} alt="logo" />
        </Box>
        {below}
      </Box>
    )
  })
}
