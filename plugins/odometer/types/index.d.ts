declare module 'claude-code' {
  interface PluginState {
    'odometer': { startedAt: number; usd: number | null; isHidden: boolean }
  }
}
