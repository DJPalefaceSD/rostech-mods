export type Tank = { kind: string; percentUsed: number; resetsAt?: string }
export type Tanks = Tank[]

declare module 'claude-code' {
  interface PluginState {
    'gas-gauge': { tanks: Tanks; isHidden: boolean }
  }
}
