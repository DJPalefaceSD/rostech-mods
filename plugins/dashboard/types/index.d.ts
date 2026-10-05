export type Pick = string | null

/** The status row's last reading: a count when the command printed "n of m", its first line otherwise. */
export type StatusReading = { count: { n: number; of: number } | null; line: string } | null

declare module 'claude-code' {
  interface PluginState {
    'rostech-dashboard': {
      status: StatusReading
      effort: Pick
      cheapHelpers: boolean
      lastSent: string | null
      isOpen: boolean
      lastEffort: string | null
    }
  }
}
