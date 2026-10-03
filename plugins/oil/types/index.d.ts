// This week's work, counted off every model response: all of it, and Fable's share.
export type Week = { resetsAt: string; fable: number; all: number }
// A plan window that names Fable, if the plan ever reports one.
export type Limit = { kind: string; percentUsed: number; resetsAt?: string }

declare module 'claude-code' {
  interface PluginState {
    oil: { week: Week; limit: Limit | null; isHidden: boolean }
  }
}
