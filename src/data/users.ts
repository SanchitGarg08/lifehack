import type { League, User } from './types'
import { SEED_DEVICES } from './devices'
import { GREMLIN_IDS, MEMBERS } from './members.generated'

export const CURRENT_USER_ID = 'u-sanchit'

export const CAMPUS_LEAGUE_ID = 'lg-campus'
export const GREMLINS_LEAGUE_ID = 'lg-gremlins'

function devicesOf(userId: string): string[] {
  return SEED_DEVICES.filter((d) => d.ownerId === userId).map((d) => d.id)
}

const sanchit: User = {
  id: CURRENT_USER_ID,
  name: 'Sanchit',
  initials: 'SG',
  watchScore: 82,
  deviceIds: devicesOf(CURRENT_USER_ID),
  leagueIds: [CAMPUS_LEAGUE_ID, GREMLINS_LEAGUE_ID],
}

export const SEED_USERS: User[] = [
  sanchit,
  ...MEMBERS.map((m) => ({
    id: m.id,
    name: m.name,
    initials: m.initials,
    watchScore: m.watchScore,
    deviceIds: devicesOf(m.id),
    leagueIds: GREMLIN_IDS.includes(m.id)
      ? [CAMPUS_LEAGUE_ID, GREMLINS_LEAGUE_ID]
      : [CAMPUS_LEAGUE_ID],
  })),
]

export const DAY_ONE_DELTAS: Record<string, number> = Object.fromEntries(
  MEMBERS.map((m) => [m.id, m.dayOneDelta]),
)

export const SEED_LEAGUES: League[] = [
  {
    id: CAMPUS_LEAGUE_ID,
    name: 'NUS Campus League',
    kind: 'campus',
    memberIds: SEED_USERS.map((u) => u.id),
  },
  {
    id: GREMLINS_LEAGUE_ID,
    name: 'COM1 Gremlins',
    kind: 'private',
    joinCode: 'GREMLIN',
    memberIds: GREMLIN_IDS,
  },
]

/** The only code the join field accepts. */
export const VALID_JOIN_CODE = 'GREMLIN'

export const RIVAL_ID = 'u-priya'
