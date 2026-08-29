import { DEMO_START } from '../demo/clock'
import type { Device, DeviceState, DeviceType } from './types'
import {
  PRINTER_HISTORY,
  PROJECTOR_HISTORY,
  buildHistory,
  type HistoryProfile,
} from './histories'

/** Believable active/standby pairs. Standby lands at 5-10% of active. */
export const WATTS: Record<DeviceType, { active: number; standby: number }> = {
  projector: { active: 210, standby: 9 },
  printer: { active: 90, standby: 6 },
  monitor: { active: 35, standby: 2 },
  tv: { active: 120, standby: 8 },
  'av-rack': { active: 140, standby: 12 },
  desktop: { active: 160, standby: 10 },
  kettle: { active: 1800, standby: 3 },
  vending: { active: 320, standby: 24 },
}

export const TYPE_LABEL: Record<DeviceType, string> = {
  projector: 'Projector',
  printer: 'Printer',
  monitor: 'Monitor',
  tv: 'Display',
  'av-rack': 'AV rack',
  desktop: 'Desktop',
  kettle: 'Kettle',
  vending: 'Vending',
}

interface Spec {
  id: string
  name: string
  type: DeviceType
  building: string
  room: string
  ownerId?: string | null
  state?: DeviceState
  score?: number
  neglect?: 1 | 2 | 3 | 4 | 5
  cleanNights?: number
  asleepNights?: number
  profile?: HistoryProfile
  history?: number[]
}

function make(spec: Spec, seed: number): Device {
  const { active, standby } = WATTS[spec.type]
  const state = spec.state ?? 'off'
  const profile: HistoryProfile =
    spec.profile ?? ((spec.neglect ?? 1) >= 4 ? 'leaky' : 'clean')
  const history =
    spec.history ?? buildHistory(profile, active, standby, seed, spec.type === 'kettle')
  const currentWatts = state === 'in-use' ? active : state === 'asleep' ? standby : 0
  const wattHistory = [...history]
  wattHistory[wattHistory.length - 1] = currentWatts

  return {
    id: spec.id,
    name: spec.name,
    type: spec.type,
    building: spec.building,
    room: spec.room,
    ownerId: spec.ownerId ?? null,
    state,
    activeWatts: active,
    standbyWatts: standby,
    currentWatts,
    // Unadopted devices that are already asleep have been asleep a while.
    asleepSince:
      state === 'asleep' ? DEMO_START - (90 + (seed % 11) * 47 + (spec.neglect ?? 1) * 55) : null,
    stewardshipScore: spec.score ?? 100,
    neglectRating: spec.neglect ?? 1,
    cleanNights: spec.cleanNights ?? 0,
    nightsLeftAsleep: spec.asleepNights ?? 0,
    nightsTracked: 20,
    wattHistory,
    atRisk: false,
  }
}

const SPECS: Spec[] = [
  // --- Sanchit's three ---------------------------------------------------
  {
    id: 'lt19-projector',
    name: 'LT19 Projector',
    type: 'projector',
    building: 'LT19',
    room: 'Main Theatre',
    ownerId: 'u-sanchit',
    state: 'in-use',
    score: 94,
    neglect: 1,
    cleanNights: 11,
    asleepNights: 1,
    history: PROJECTOR_HISTORY,
  },
  {
    id: 'com1-printer',
    name: 'COM1 Print Room Printer',
    type: 'printer',
    building: 'COM1',
    room: 'Level 2 Print Room',
    ownerId: 'u-sanchit',
    state: 'off',
    score: 88,
    neglect: 4,
    cleanNights: 0,
    asleepNights: 11,
    history: PRINTER_HISTORY,
  },
  {
    id: 'com1-monitor',
    name: 'COM1 Lab Monitor B108',
    type: 'monitor',
    building: 'COM1',
    room: 'B108 Programming Lab',
    ownerId: 'u-sanchit',
    state: 'off',
    score: 64,
    neglect: 5,
    cleanNights: 2,
    asleepNights: 14,
    profile: 'clean',
  },

  // --- Adopted by other students -----------------------------------------
  { id: 'com1-kettle', name: 'COM1 Pantry Kettle', type: 'kettle', building: 'COM1', room: 'Level 2 Pantry', ownerId: 'u-073', score: 91, neglect: 2, cleanNights: 6, asleepNights: 3 },
  { id: 'com2-projector', name: 'COM2 Lecture Projector', type: 'projector', building: 'COM2', room: 'LT15', ownerId: 'u-007', score: 96, neglect: 1, cleanNights: 19, asleepNights: 0 },
  { id: 'com3-projector', name: 'COM3 Studio Projector', type: 'projector', building: 'COM3', room: 'Level 1 Studio', ownerId: 'u-057', score: 79, neglect: 3, cleanNights: 4, asleepNights: 8 },
  { id: 'lt19-desktop', name: 'LT19 Lectern Desktop', type: 'desktop', building: 'LT19', room: 'Lectern', ownerId: 'u-076', score: 85, neglect: 3, cleanNights: 5, asleepNights: 7 },
  { id: 'e4-printer', name: 'E4 Print Room Printer', type: 'printer', building: 'E4', room: 'Level 3 Print Room', ownerId: 'u-marcus', state: 'off', score: 73, neglect: 4, cleanNights: 1, asleepNights: 13 },
  { id: 's16-vending', name: 'S16 Corridor Vending', type: 'vending', building: 'S16', room: 'Level 2 Corridor', ownerId: 'u-045', score: 88, neglect: 2, cleanNights: 9, asleepNights: 4 },
  { id: 'as6-projector', name: 'AS6 Seminar Projector', type: 'projector', building: 'AS6', room: 'AS6-03-20', ownerId: 'u-022', score: 93, neglect: 1, cleanNights: 14, asleepNights: 1 },
  { id: 'lib-monitor', name: 'Central Library Study Monitor', type: 'monitor', building: 'Central Library', room: 'Level 5 Quiet Zone', ownerId: 'u-049', score: 81, neglect: 3, cleanNights: 3, asleepNights: 9 },
  { id: 'erc-kettle', name: 'UTown ERC Pantry Kettle', type: 'kettle', building: 'UTown ERC', room: 'Level 4 Pantry', ownerId: 'u-063', score: 90, neglect: 2, cleanNights: 8, asleepNights: 4 },
  { id: 'yih-avrack', name: 'YIH Meeting Room AV Rack', type: 'av-rack', building: 'YIH', room: 'Meeting Room 4', ownerId: 'u-090', score: 76, neglect: 4, cleanNights: 2, asleepNights: 12 },

  // --- Unadopted ----------------------------------------------------------
  { id: 'com1-avrack', name: 'COM1 Seminar AV Rack', type: 'av-rack', building: 'COM1', room: 'SR2, Level 3', state: 'asleep', neglect: 5, asleepNights: 17, score: 41 },
  { id: 'com1-tv', name: 'COM1 Foyer Display', type: 'tv', building: 'COM1', room: 'Level 1 Foyer', state: 'asleep', neglect: 5, asleepNights: 16, score: 44 },
  { id: 'com2-desktop', name: 'COM2 Hackerspace Desktop', type: 'desktop', building: 'COM2', room: 'Level 3 Hackerspace', state: 'asleep', neglect: 5, asleepNights: 18, score: 38 },
  { id: 'com2-printer', name: 'COM2 Print Room Printer', type: 'printer', building: 'COM2', room: 'Level 4 Print Room', neglect: 4, asleepNights: 12, score: 57 },
  { id: 'com2-vending', name: 'COM2 Corridor Vending', type: 'vending', building: 'COM2', room: 'Level 1 Corridor', neglect: 3, asleepNights: 7, score: 68 },
  { id: 'com3-tv', name: 'COM3 Meeting Room Display', type: 'tv', building: 'COM3', room: 'Meeting Room 3-4', state: 'asleep', neglect: 4, asleepNights: 13, score: 55 },
  { id: 'com3-monitor', name: 'COM3 Lab Monitor', type: 'monitor', building: 'COM3', room: 'Level 2 Lab', neglect: 2, asleepNights: 4, score: 84 },
  { id: 'lt19-avrack', name: 'LT19 Control Booth AV Rack', type: 'av-rack', building: 'LT19', room: 'Control Booth', state: 'asleep', neglect: 5, asleepNights: 19, score: 33 },
  { id: 'e4-projector', name: 'E4 Seminar Projector', type: 'projector', building: 'E4', room: 'E4-06-02', neglect: 4, asleepNights: 14, score: 52 },
  { id: 'e4-monitor', name: 'E4 Fluids Lab Monitor', type: 'monitor', building: 'E4', room: 'Fluids Lab', neglect: 2, asleepNights: 5, score: 82 },
  { id: 'e4-kettle', name: 'E4 Pantry Kettle', type: 'kettle', building: 'E4', room: 'Level 5 Pantry', neglect: 1, asleepNights: 2, score: 92 },
  { id: 's16-projector', name: 'S16 Lecture Projector', type: 'projector', building: 'S16', room: 'S16-03-01', state: 'asleep', neglect: 5, asleepNights: 15, score: 47 },
  { id: 's16-desktop', name: 'S16 Instrument Room Desktop', type: 'desktop', building: 'S16', room: 'Instrument Room', neglect: 4, asleepNights: 12, score: 58 },
  { id: 'as6-avrack', name: 'AS6 Media Studio AV Rack', type: 'av-rack', building: 'AS6', room: 'Media Studio', state: 'asleep', neglect: 5, asleepNights: 18, score: 36 },
  { id: 'as6-monitor', name: 'AS6 Edit Suite Monitor', type: 'monitor', building: 'AS6', room: 'Edit Suite 2', neglect: 3, asleepNights: 8, score: 71 },
  { id: 'as6-tv', name: 'AS6 Screening Room Display', type: 'tv', building: 'AS6', room: 'Screening Room', neglect: 4, asleepNights: 11, score: 61 },
  { id: 'lib-printer', name: 'Central Library Print Station', type: 'printer', building: 'Central Library', room: 'Level 3 Print Hub', state: 'asleep', neglect: 5, asleepNights: 16, score: 43 },
  { id: 'lib-vending', name: 'Central Library Vending', type: 'vending', building: 'Central Library', room: 'Level 1 Lobby', neglect: 3, asleepNights: 9, score: 66 },
  { id: 'lib-desktop', name: 'Central Library Media Desk', type: 'desktop', building: 'Central Library', room: 'Level 4 Media Desk', neglect: 4, asleepNights: 13, score: 54 },
  { id: 'lib-monitor-2', name: 'Central Library Catalogue Monitor', type: 'monitor', building: 'Central Library', room: 'Level 1 Catalogue', neglect: 2, asleepNights: 3, score: 87 },
  { id: 'erc-projector', name: 'UTown ERC Seminar Projector', type: 'projector', building: 'UTown ERC', room: 'Seminar Room 3', state: 'asleep', neglect: 5, asleepNights: 17, score: 39 },
  { id: 'erc-avrack', name: 'UTown ERC Auditorium AV Rack', type: 'av-rack', building: 'UTown ERC', room: 'Auditorium 2', neglect: 4, asleepNights: 14, score: 49 },
  { id: 'erc-monitor', name: 'UTown ERC Commons Monitor', type: 'monitor', building: 'UTown ERC', room: 'Level 2 Commons', neglect: 2, asleepNights: 4, score: 83 },
  { id: 'erc-printer', name: 'UTown ERC Print Hub', type: 'printer', building: 'UTown ERC', room: 'Level 1 Print Hub', neglect: 3, asleepNights: 9, score: 65 },
  { id: 'yih-tv', name: 'YIH Atrium Display', type: 'tv', building: 'YIH', room: 'Atrium', state: 'asleep', neglect: 5, asleepNights: 19, score: 31 },
  { id: 'yih-projector', name: 'YIH Function Room Projector', type: 'projector', building: 'YIH', room: 'Function Room 2', neglect: 4, asleepNights: 12, score: 56 },
  { id: 'yih-printer', name: 'YIH Admin Printer', type: 'printer', building: 'YIH', room: 'Level 2 Admin', neglect: 2, asleepNights: 5, score: 80 },
  { id: 'yih-vending', name: 'YIH Cafe Vending', type: 'vending', building: 'YIH', room: 'Level 1 Cafe', neglect: 3, asleepNights: 8, score: 69 },
]

export const BUILDING_ORDER = [
  'COM1', 'COM2', 'COM3', 'LT19', 'E4',
  'S16', 'AS6', 'Central Library', 'UTown ERC', 'YIH',
]

export const SEED_DEVICES: Device[] = SPECS.map((spec, i) => make(spec, 1000 + i * 37))

export const DEVICE_COUNT = SEED_DEVICES.length
