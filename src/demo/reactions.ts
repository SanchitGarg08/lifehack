import type { FeedEventKind } from '../data/types'
import { seeded } from './rng'

/** The emoji that fit each kind of thing that happens. */
const SETS: Record<FeedEventKind, string[]> = {
  'powered-off': ['🔥', '👏', '🫡'],
  'left-asleep': ['💀', '😤', '👀'],
  steal: ['😱', '🍿', '🔥'],
  claim: ['🫡', '👀', '💪'],
  streak: ['🔥', '💪', '👏'],
}

/**
 * Baseline counts. Seeded off the event id so the same story always carries
 * the same reactions, every run of the demo.
 */
export function baseCounts(id: string, kind: FeedEventKind): [string, number][] {
  let seed = 0
  for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) >>> 0
  const rand = seeded(seed || 7)
  return SETS[kind].map((emoji) => [emoji, 1 + Math.floor(rand() * 4)])
}
