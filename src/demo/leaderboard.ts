import {
  CAMPUS_LEAGUE_ID,
  CURRENT_USER_ID,
  GREMLINS_LEAGUE_ID,
  SEED_LEAGUES,
  SEED_USERS,
} from '../data/users'
import type { DemoState } from './store'

export interface Row {
  id: string
  name: string
  initials: string
  score: number
  rank: number
  isYou: boolean
}

const USER_BY_ID = new Map(SEED_USERS.map((u) => [u.id, u]))

export function buildLeaderboard(
  state: DemoState,
  leagueId: string,
  yourScore: number,
): Row[] {
  const league = SEED_LEAGUES.find((l) => l.id === leagueId)
  if (!league) return []
  const rows = league.memberIds
    .map((id) => {
      const user = USER_BY_ID.get(id)
      if (!user) return null
      const score =
        id === CURRENT_USER_ID ? yourScore : (state.memberScores[id] ?? user.watchScore)
      return {
        id,
        name: user.name,
        initials: user.initials,
        score: Math.round(score * 10) / 10,
        isYou: id === CURRENT_USER_ID,
      }
    })
    .filter((r): r is Omit<Row, 'rank'> => r !== null)
    // Ties break by name so the board is stable across every run.
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))

  return rows.map((r, i) => ({ ...r, rank: i + 1 }))
}

export function yourRank(rows: Row[]): number {
  return rows.find((r) => r.isYou)?.rank ?? 0
}

export { CAMPUS_LEAGUE_ID, GREMLINS_LEAGUE_ID }
