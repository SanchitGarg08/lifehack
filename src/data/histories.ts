import { pick, seeded } from '../demo/rng'

/**
 * 48 readings, oldest first, 30 minutes apart: 18:30 yesterday -> 18:00 today.
 * Index 3..28 is the night (20:00 -> 08:30). Whether those 26 readings sit on
 * the axis or float above it is the whole product.
 */
export const HISTORY_LENGTH = 48
export const NIGHT_END_INDEX = 28

export type HistoryProfile = 'clean' | 'leaky'

function activeJitter(active: number, rand: () => number): number {
  return Math.max(1, Math.round(active * (1 + (rand() - 0.5) * 0.05)))
}

function idleJitter(idle: number, rand: () => number): number {
  if (idle === 0) return 0
  return rand() < 0.22 ? idle + 1 : idle
}

/**
 * Deterministic, not random: same seed in, same 48 numbers out, every run.
 * `burst` is for kettles, which are used in single 30-minute spikes rather
 * than sustained blocks.
 */
export function buildHistory(
  profile: HistoryProfile,
  active: number,
  standby: number,
  seed: number,
  burst = false,
): number[] {
  const rand = seeded(seed)
  const idle = profile === 'clean' ? 0 : standby
  const out: number[] = new Array(HISTORY_LENGTH).fill(0)

  const eveningEnd = pick(rand, 1, 3)
  for (let i = 0; i < eveningEnd; i++) out[i] = activeJitter(active, rand)
  for (let i = eveningEnd; i <= NIGHT_END_INDEX; i++) out[i] = idleJitter(idle, rand)

  let i = NIGHT_END_INDEX + 1
  let inUse = true
  while (i < HISTORY_LENGTH) {
    const run = inUse ? (burst ? 1 : pick(rand, 1, 3)) : pick(rand, 1, burst ? 5 : 3)
    for (let k = 0; k < run && i < HISTORY_LENGTH; k++, i++) {
      out[i] = inUse ? activeJitter(active, rand) : idleJitter(idle, rand)
    }
    inUse = !inUse
  }
  return out
}

/**
 * LT19 Projector, 210W / 9W. The clean shape: an evening lecture, a hard drop
 * to zero at 20:00, twenty-six readings sitting on the axis, then a working
 * day where every gap between lectures also reaches zero.
 */
export const PROJECTOR_HISTORY: number[] = [
  210, 212, 206,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  208, 211, 209,
  0, 0,
  207, 210,
  0, 0, 0,
  206, 212, 209,
  0, 0,
  210, 213, 208, 210,
]

/**
 * COM1 Print Room Printer, 90W / 6W. The leaky shape: the same working day,
 * but at 19:00 the draw steps down to 6W instead of zero and holds there for
 * fourteen hours. ~85 Wh paid for nothing, which is almost exactly what
 * tonight's projection warns about.
 */
export const PRINTER_HISTORY: number[] = [
  88,
  6, 6, 6, 6, 7, 6, 6, 6, 6, 6, 6, 7, 6, 6,
  6, 6, 6, 6, 7, 6, 6, 6, 6, 6, 6, 6, 7, 6,
  92,
  6, 6,
  89,
  6, 6,
  91,
  6, 6, 6,
  87,
  6, 6,
  90,
  6, 6,
  86,
  6,
  0,
]
