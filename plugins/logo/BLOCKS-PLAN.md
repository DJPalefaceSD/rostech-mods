# Logo, in coloured blocks — the plan

The first Logo drew the PNG with the `Image` element. His terminal cannot draw
pictures, so it showed a grey "logo" instead. Shelved 2 Oct 2026.

## The fix, designed and not yet built

- `/logo set <png>` runs PowerShell (System.Drawing) to shrink the PNG to
  `columns x rows*2` pixels with HighQualityBicubic, and prints one RRGGBBAA
  hex value per pixel. The path goes in as an env value (`LOGO_FILE`), never on
  the command line.
- Each terminal cell is U+2580 (upper half block). Its foreground is the top
  pixel and its background the bottom one, so two square pixels fit per cell.
  A pixel under alpha 128 uses `0x01000000`, the terminal's own colour.
- The cells are packed as the `Raster` element wants them: base64 of
  little-endian u32 triplets `[codePoint, fg, bg]`. Encode the base64 by hand;
  don't rely on `Uint8Array.toBase64` being present.
- Store `{ columns, rows, cells }` in `$.store`, and draw a `Raster`. It is
  terminal-only, so skip other surfaces.
- Default to 3 rows by 6 columns. The LCG mark is plain C shapes, so it should
  read even that small. Check it on his screen before calling it done.
- Order on the dash: "logo" sorts between gas-gauge and speedometer. Both gauges
  take half the band each, so the logo needs them at about 45% again. That
  change was made once and then undone on 2 Oct.

His logo file:
C:/Development/ComicBookStudioSimulator/_work/lcg-creator-kit-pink-text-update/accent/marks/lcg-mark-transparent.png
