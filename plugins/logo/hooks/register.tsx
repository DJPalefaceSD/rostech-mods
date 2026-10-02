import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'
import type { LogoPicture } from '../types'

// The logo on the dash, already shrunk to coloured cells. $.store keeps it across
// sessions, so the PNG is read once, when it is set, and never again.
const picture = atom({ plugin: 'logo', key: 'picture' } as const, null as LogoPicture | null)
const isHidden = atom({ plugin: 'logo', key: 'isHidden' } as const, false)

// A terminal cell is about twice as tall as it is wide. Each cell is an upper
// half block: its foreground is the top pixel and its background the bottom one,
// so two square pixels fit in a cell.
//
// 0.2.0 shrank every PNG to 12 by 12 pixels with smoothing, and his mark came
// out pixellated: its thinnest bars fell between pixels and smeared. Now a PNG
// of MAX pixels a side or smaller is drawn pixel for pixel, so a mark drawn by
// hand for the dash arrives exactly as drawn. A bigger PNG is trimmed to the
// mark and shrunk to 16 by 16, and every pixel is either the mark's colour or
// clear, never a blend of the two.
const MAX = 40
const COLUMNS = 16
const PIXEL_ROWS = 16
const HALF_BLOCK = 0x2580
const TERMINAL_COLOUR = 0x01000000

// One pixel as the Raster wants its colour. A pixel under half see-through takes
// the terminal's own colour, and one over it takes its own colour in full.
function colour(rgba: string): number {
  return parseInt(rgba.slice(6, 8), 16) < 128 ? TERMINAL_COLOUR : parseInt(rgba.slice(0, 6), 16)
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

// Standard padded base64, by hand, so it does not lean on a runtime helper.
function base64(bytes: readonly number[]): string {
  let text = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i]
    const b = bytes[i + 1]
    const c = bytes[i + 2]
    const n = (a << 16) | ((b ?? 0) << 8) | (c ?? 0)
    text += ALPHABET[(n >> 18) & 63] + ALPHABET[(n >> 12) & 63]
    text += b === undefined ? '=' : ALPHABET[(n >> 6) & 63]
    text += c === undefined ? '=' : ALPHABET[n & 63]
  }
  return text
}

// Pixels, two rows per cell, packed as little-endian u32 triplets [glyph, fg, bg].
function cells(pixels: readonly string[], columns: number, rows: number): string {
  const bytes: number[] = []
  const word = (n: number) => bytes.push(n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255)
  for (let row = 0; row < rows; row++) {
    for (let x = 0; x < columns; x++) {
      word(HALF_BLOCK)
      word(colour(pixels[row * 2 * columns + x]))
      word(colour(pixels[(row * 2 + 1) * columns + x]))
    }
  }
  return base64(bytes)
}

async function shrink($: EngineInterface, file: string): Promise<LogoPicture | null> {
  const ran = await $.process
    .run(['powershell.exe', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', `${$.plugin.root}/hooks/shrink.ps1`], {
      env: { LOGO_FILE: file, LOGO_MAX: String(MAX), LOGO_W: String(COLUMNS), LOGO_H: String(PIXEL_ROWS) },
      timeoutMs: 20000,
    })
    .catch(() => null)
  const words = ran && ran.exitCode === 0 ? ran.stdout.trim().split(/\s+/) : []
  const [columns, height] = [Number(words[0]), Number(words[1])]
  const pixels = words.slice(2)
  if (!(columns > 0 && height > 0 && height % 2 === 0) || pixels.length !== columns * height) return null
  if (!pixels.every(p => /^[0-9A-F]{8}$/i.test(p))) return null
  return { file, columns, rows: height / 2, cells: cells(pixels, columns, height / 2) }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'logo', description: 'Put your logo on the dash. /logo set <path to a PNG>, /logo hide, /logo show.' })
    const kept = (await $.store.get('picture')) as LogoPicture | undefined
    if (kept && typeof kept.cells === 'string') await update($, picture, () => kept)
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
      const made = await shrink($, path)
      if (!made) return { text: `Could not read ${path}. Check the path, and that it is a PNG.` }
      await $.store.set('picture', made)
      await update($, picture, () => made)
      return { text: `Logo set: ${path}, ${made.columns} columns by ${made.rows} rows.` }
    }
    const now = await read($, picture)
    return { text: now ? `Logo: ${now.file}` : 'No logo yet. /logo set <path to a PNG> puts one on the dash.' }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const now = await read($, picture)
    if (e.props.hasSurvey || !now || e.surface !== 'terminal' || (await read($, isHidden))) return next(e)

    const { Box, Raster } = $.ui.resolve(e)
    // Ours, then every other band above the prompt draws beside it.
    const below = await next(e)
    return (
      <Box flexDirection="row">
        <Box marginRight={2} flexShrink={0}>
          <Raster key="logo" columns={now.columns} rows={now.rows} cells={now.cells} />
        </Box>
        {below}
      </Box>
    )
  })
}
