// The logo already shrunk to terminal cells: base64 of [glyph, fg, bg] u32 triplets.
export type LogoPicture = { file: string; columns: number; rows: number; cells: string }

declare module 'claude-code' {
  interface PluginState {
    'logo': { picture: LogoPicture | null; isHidden: boolean }
  }
}
