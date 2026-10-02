import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'
import type { LogoPicture } from '../types'

// The logo on the dash, already shrunk to coloured cells. $.store keeps it across
// sessions, so the PNG is read once, when it is set, and never again.
const picture = atom({ plugin: 'logo', key: 'picture' } as const, null as LogoPicture | null)
const isHidden = atom({ plugin: 'logo', key: 'isHidden' } as const, false)

// A terminal cell is about twice as tall as it is wide. Each cell is an upper
// half block: its foreground is the top pixel and its background the bottom one,
// so 12 columns by 6 rows is a square of 12 by 12 pixels. That is the smallest
// size where the LCG mark still reads: at 6 by 6 it was a smudge.
const COLUMNS = 12
const ROWS = 6
const HALF_BLOCK = 0x2580
const TERMINAL_COLOUR = 0x01000000

// Shrinks the PNG named in LOGO_FILE to LOGO_W by LOGO_H pixels, centred and with
// its own proportions kept, and prints one RRGGBBAA value per pixel, row by row.
// The path goes in as an environment value, never on the command line.
const SHRINK =
  'Add-Type -AssemblyName System.Drawing; ' +
  '$w = [int]$env:LOGO_W; $h = [int]$env:LOGO_H; ' +
  '$src = [System.Drawing.Image]::FromFile($env:LOGO_FILE); ' +
  '$out = New-Object System.Drawing.Bitmap $w, $h; ' +
  '$g = [System.Drawing.Graphics]::FromImage($out); ' +
  '$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic; ' +
  '$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality; ' +
  '$s = [Math]::Min($w / $src.Width, $h / $src.Height); ' +
  '$dw = $src.Width * $s; $dh = $src.Height * $s; ' +
  '$g.DrawImage($src, [single](($w - $dw) / 2), [single](($h - $dh) / 2), [single]$dw, [single]$dh); ' +
  '$px = for ($y = 0; $y -lt $h; $y++) { for ($x = 0; $x -lt $w; $x++) { $c = $out.GetPixel($x, $y); ' +
  "'{0:X2}{1:X2}{2:X2}{3:X2}' -f $c.R, $c.G, $c.B, $c.A } }; " +
  "$px -join ' '"

// One pixel as the Raster wants its colour. Mostly see-through ones take the
// terminal's own; the cut is low because shrinking thins every edge.
function colour(rgba: string): number {
  const alpha = parseInt(rgba.slice(6, 8), 16)
  return alpha < 64 ? TERMINAL_COLOUR : parseInt(rgba.slice(0, 6), 16)
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
    .run(['powershell.exe', '-NoProfile', '-Command', SHRINK], {
      env: { LOGO_FILE: file, LOGO_W: String(COLUMNS), LOGO_H: String(ROWS * 2) },
      timeoutMs: 20000,
    })
    .catch(() => null)
  const pixels = ran && ran.exitCode === 0 ? ran.stdout.trim().split(/\s+/) : []
  if (pixels.length !== COLUMNS * ROWS * 2 || !pixels.every(p => /^[0-9A-F]{8}$/i.test(p))) return null
  return { file, columns: COLUMNS, rows: ROWS, cells: cells(pixels, COLUMNS, ROWS) }
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
      return { text: `Logo set: ${path}` }
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
