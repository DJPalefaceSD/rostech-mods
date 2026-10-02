// One turn's tokens, and when the turn ended (ms since the epoch).
export type Burn = { at: number; tokens: number }

declare module 'claude-code' {
  interface PluginState {
    'tach': { burns: Burn[]; now: number; windowMin: number; peak: number; isHidden: boolean }
  }
}
