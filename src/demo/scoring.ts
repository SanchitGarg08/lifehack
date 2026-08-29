import type { Device } from '../data/types'

/**
 * One point per 9 watt-hours of standby. A 9W projector costs 1 point an
 * hour; a 2W monitor costs 0.22. Being in use costs nothing, ever.
 */
export const WATT_HOURS_PER_POINT = 9

/** Charged once if a device is still asleep at 08:00. It also goes at-risk. */
export const AT_RISK_PENALTY = 8

/** Recovery is deliberately slow. There is no jackpot. */
export const RECOVERY_PER_CLEAN_NIGHT = 0.5

/**
 * The real grace window is 90 minutes. On stage the clock runs at 60x, so it
 * plays out in 90 seconds. The compression is in the clock, not in the rules:
 * one demo second is one campus minute, and the UI says so.
 */
export const GRACE_MINUTES = 90
export const DEMO_TIME_SCALE = 60

export function drainPoints(standbyWatts: number, hours: number): number {
  return (hours * standbyWatts) / WATT_HOURS_PER_POINT
}

export function wattHours(standbyWatts: number, hours: number): number {
  return standbyWatts * hours
}

export function clampScore(n: number): number {
  return Math.max(0, Math.min(100, n))
}

/** Shown as 94.5 while draining, 94 when settled. */
export function formatScore(n: number): string {
  const rounded = Math.round(n * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

/** Watch Score is the plain average across adopted devices. */
export function watchScore(devices: Device[]): number {
  if (devices.length === 0) return 0
  const sum = devices.reduce((acc, d) => acc + d.stewardshipScore, 0)
  return Math.round((sum / devices.length) * 10) / 10
}
