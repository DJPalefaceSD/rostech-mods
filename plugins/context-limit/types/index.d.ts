declare module 'claude-code' {
  interface PluginState {
    'context-limit': { heat: number | null; isHidden: boolean }
  }
}
