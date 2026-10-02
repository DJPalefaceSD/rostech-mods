declare module 'claude-code' {
  interface PluginState {
    'temp-gauge': { heat: number | null; isHidden: boolean }
  }
}
