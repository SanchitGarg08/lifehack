export type DeviceType =
  | 'projector'
  | 'printer'
  | 'monitor'
  | 'tv'
  | 'av-rack'
  | 'desktop'
  | 'kettle'
  | 'vending'

export type DeviceState = 'in-use' | 'asleep' | 'off'

export interface Device {
  id: string
  name: string
  type: DeviceType
  building: string
  room: string
  ownerId: string | null
  state: DeviceState
  activeWatts: number
  standbyWatts: number
  currentWatts: number
  /** Demo-clock minutes-since-epoch at which the device went to standby. */
  asleepSince: number | null
  stewardshipScore: number
  neglectRating: 1 | 2 | 3 | 4 | 5
  cleanNights: number
  nightsLeftAsleep: number
  nightsTracked: number
  /** Exactly 48 readings, oldest first, 30 minutes apart. */
  wattHistory: number[]
  atRisk: boolean
}

export interface User {
  id: string
  name: string
  initials: string
  watchScore: number
  deviceIds: string[]
  leagueIds: string[]
}

export interface League {
  id: string
  name: string
  kind: 'campus' | 'private'
  joinCode?: string
  memberIds: string[]
}

export type FeedEventKind =
  | 'powered-off'
  | 'left-asleep'
  | 'steal'
  | 'claim'
  | 'streak'

export interface FeedEvent {
  id: string
  /** Demo-clock minutes-since-epoch. */
  timestamp: number
  kind: FeedEventKind
  actorId: string
  deviceId: string | null
  scoreDelta: number
  text: string
}
