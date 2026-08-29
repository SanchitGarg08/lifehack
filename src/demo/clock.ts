/**
 * The demo clock is minutes since Tuesday 00:00. It never reads the wall
 * clock, so the app looks the same at 9am and at 2am on stage.
 */
export const DEMO_START = 18 * 60 // Tue 18:00
export const MORNING = 24 * 60 + 8 * 60 // Wed 08:00
export const MINUTES_TO_MORNING = MORNING - DEMO_START // 840 = 14h

const DAYS = ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon']

export function timeOfDay(minutes: number): string {
  const m = ((Math.floor(minutes) % 1440) + 1440) % 1440
  const h = Math.floor(m / 60)
  return `${String(h).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

export function dayLabel(minutes: number): string {
  return DAYS[Math.floor(Math.max(0, minutes) / 1440) % 7]
}

/** "4h 12m" / "38m" — used for time-asleep counters. */
export function duration(minutes: number): string {
  const total = Math.max(0, Math.round(minutes))
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m}m`
  return `${h}h ${String(m).padStart(2, '0')}m`
}

/** Minutes from `clock` until the next 08:00. */
export function minutesUntilMorning(clock: number): number {
  const dayStart = Math.floor(clock / 1440) * 1440
  let target = dayStart + 8 * 60
  while (target <= clock) target += 1440
  return target - clock
}
