import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react'
import type { Device, FeedEvent } from '../data/types'
import { SEED_DEVICES } from '../data/devices'
import { SEED_FEED } from '../data/feed'
import {
  CAMPUS_LEAGUE_ID,
  CURRENT_USER_ID,
  DAY_ONE_DELTAS,
  RIVAL_ID,
  SEED_LEAGUES,
  SEED_USERS,
} from '../data/users'
import { DEMO_START, minutesUntilMorning } from './clock'
import {
  AT_RISK_PENALTY,
  formatScore,
  GRACE_MINUTES,
  RECOVERY_PER_CLEAN_NIGHT,
  clampScore,
  drainPoints,
  watchScore,
} from './scoring'
import { NIGHT_END_INDEX, buildHistory } from '../data/histories'

export type TabId = 'watch' | 'adopt' | 'leagues' | 'feed'

export interface Notice {
  id: string
  title: string
  body: string
  tone: 'live' | 'standby' | 'settled'
}

export interface Confirmation {
  deviceId: string
  pointsReturned: number
  cleanNights: number
  score: number
  /** Set for ~1.4s so the sparkline can play the fall onto the axis. */
  playing: boolean
}

/** A full-screen moment. Fired only on settled events, never on live drain. */
export interface Celebration {
  id: number
  kind: 'up' | 'down'
  headline: string
  figure: string
  detail: string
}

export interface MorningSettlement {
  deviceId: string
  hours: number
  wattHours: number
  drain: number
  penalty: number
  before: number
  after: number
}

interface DeviceRuntime {
  /** Score at the instant the device went to standby, used to refund. */
  scoreAtSleep: number
  /** Demo-clock minute the user tapped "I'm on it". */
  graceStart: number | null
  /**
   * Where the live drain counts from. Normally the moment it fell asleep, but
   * the 08:00 settlement books the night and moves the baseline forward so the
   * card stops re-charging for hours already paid for.
   */
  drainFrom: number
}

export interface DemoState {
  clock: number
  running: boolean
  devices: Device[]
  runtime: Record<string, DeviceRuntime>
  memberScores: Record<string, number>
  feed: FeedEvent[]
  tab: TabId
  panelOpen: boolean
  confirmation: Confirmation | null
  settlement: MorningSettlement | null
  notice: Notice | null
  activeLeagueId: string
  createdLeague: { name: string; code: string } | null
  joinedGremlins: boolean
  day: number
  /** Device whose detail sheet is open, if any. */
  openDeviceId: string | null
  /** Emoji the current user has added, keyed by feed event id. */
  myReactions: Record<string, string[]>
  celebration: Celebration | null
  celebrationSeq: number
}

function clone(devices: Device[]): Device[] {
  return devices.map((d) => ({ ...d, wattHistory: [...d.wattHistory] }))
}

function initialState(): DemoState {
  return {
    clock: DEMO_START,
    running: false,
    devices: clone(SEED_DEVICES),
    runtime: {},
    memberScores: Object.fromEntries(
      SEED_USERS.filter((u) => u.id !== CURRENT_USER_ID).map((u) => [u.id, u.watchScore]),
    ),
    feed: [...SEED_FEED],
    tab: 'watch',
    panelOpen: false,
    confirmation: null,
    settlement: null,
    notice: null,
    activeLeagueId: CAMPUS_LEAGUE_ID,
    createdLeague: null,
    joinedGremlins: true,
    day: 0,
    openDeviceId: null,
    myReactions: {},
    celebration: null,
    celebrationSeq: 0,
  }
}

type Action =
  | { type: 'tick'; minutes: number }
  | { type: 'set-tab'; tab: TabId }
  | { type: 'toggle-panel'; open?: boolean }
  | { type: 'sleep'; deviceId: string }
  | { type: 'on-it'; deviceId: string }
  | { type: 'power-off'; deviceId: string }
  | { type: 'end-confirmation' }
  | { type: 'advance-to-morning' }
  | { type: 'rival-adopts' }
  | { type: 'advance-day' }
  | { type: 'adopt'; deviceId: string }
  | { type: 'set-league'; leagueId: string }
  | { type: 'create-league'; name: string; code: string }
  | { type: 'dismiss-notice' }
  | { type: 'open-device'; deviceId: string | null }
  | { type: 'react'; eventId: string; emoji: string }
  | { type: 'clear-celebration' }
  | { type: 'clear-settlement' }
  | { type: 'reset' }

/** Live score while asleep: a pure function of the clock, so it never drifts. */
export function liveScore(state: DemoState, device: Device): number {
  if (device.state !== 'asleep' || device.asleepSince === null) return device.stewardshipScore
  const rt = state.runtime[device.id]
  if (!rt) return device.stewardshipScore
  const hours = Math.max(0, state.clock - rt.drainFrom) / 60
  return clampScore(rt.scoreAtSleep - drainPoints(device.standbyWatts, hours))
}

/** Standby minutes the sparkline has not yet absorbed into wattHistory. */
export function liveTailMinutes(state: DemoState, device: Device): number {
  const rt = state.runtime[device.id]
  if (!rt || device.state !== 'asleep') return 0
  return Math.max(0, state.clock - rt.drainFrom)
}

export function minutesAsleep(state: DemoState, device: Device): number {
  if (device.asleepSince === null) return 0
  return Math.max(0, state.clock - device.asleepSince)
}

/** Seconds left on the grace window, or null if the user hasn't committed. */
export function graceRemaining(state: DemoState, device: Device): number | null {
  const rt = state.runtime[device.id]
  if (!rt || rt.graceStart === null) return null
  return Math.max(0, GRACE_MINUTES - (state.clock - rt.graceStart))
}

function pushHistory(device: Device, watts: number): number[] {
  const next = [...device.wattHistory.slice(1), watts]
  return next
}

/** Replace the tail of the history so the trace shows the current plateau. */
function extendPlateau(device: Device, watts: number, samples: number): number[] {
  const next = [...device.wattHistory]
  for (let i = 0; i < samples; i++) next.push(watts)
  return next.slice(-48)
}

function event(
  id: string,
  timestamp: number,
  kind: FeedEvent['kind'],
  actorId: string,
  deviceId: string | null,
  scoreDelta: number,
  text: string,
): FeedEvent {
  return { id, timestamp, kind, actorId, deviceId, scoreDelta, text }
}

function reducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case 'tick': {
      if (!state.running) return state
      return { ...state, clock: state.clock + action.minutes }
    }

    case 'set-tab':
      return { ...state, tab: action.tab }

    case 'toggle-panel':
      return { ...state, panelOpen: action.open ?? !state.panelOpen }

    case 'set-league':
      return { ...state, activeLeagueId: action.leagueId }

    case 'dismiss-notice':
      return { ...state, notice: null }

    case 'open-device':
      return { ...state, openDeviceId: action.deviceId }

    case 'react': {
      const mine = state.myReactions[action.eventId] ?? []
      const next = mine.includes(action.emoji)
        ? mine.filter((e) => e !== action.emoji)
        : [...mine, action.emoji]
      return {
        ...state,
        myReactions: { ...state.myReactions, [action.eventId]: next },
      }
    }

    case 'clear-settlement':
      return { ...state, settlement: null }

    case 'clear-celebration':
      return { ...state, celebration: null }

    case 'end-confirmation':
      return state.confirmation
        ? { ...state, confirmation: { ...state.confirmation, playing: false } }
        : state

    // --- Beat 2: the device steps down into standby -----------------------
    case 'sleep': {
      const device = state.devices.find((d) => d.id === action.deviceId)
      if (!device || device.state === 'asleep') return state
      const updated: Device = {
        ...device,
        state: 'asleep',
        currentWatts: device.standbyWatts,
        asleepSince: state.clock,
        atRisk: false,
        wattHistory: pushHistory(device, device.standbyWatts),
      }
      return {
        ...state,
        running: true,
        confirmation: null,
        settlement: null,
        devices: state.devices.map((d) => (d.id === updated.id ? updated : d)),
        runtime: {
          ...state.runtime,
          [device.id]: {
            scoreAtSleep: device.stewardshipScore,
            graceStart: null,
            drainFrom: state.clock,
          },
        },
      }
    }

    // --- Beat 4: the user commits -----------------------------------------
    case 'on-it': {
      const rt = state.runtime[action.deviceId]
      if (!rt || rt.graceStart !== null) return state
      return {
        ...state,
        runtime: {
          ...state.runtime,
          [action.deviceId]: { ...rt, graceStart: state.clock },
        },
      }
    }

    // --- Beat 5: telemetry reads 0W ---------------------------------------
    case 'power-off': {
      const device = state.devices.find((d) => d.id === action.deviceId)
      if (!device || device.state === 'off') return state
      const rt = state.runtime[device.id]
      const drained = rt ? rt.scoreAtSleep - liveScore(state, device) : 0
      const inGrace =
        rt !== undefined &&
        (rt.graceStart === null || state.clock - rt.graceStart <= GRACE_MINUTES) &&
        !device.atRisk
      // Caught inside the window: the drain is returned and the night is clean.
      const base = inGrace && rt ? rt.scoreAtSleep : liveScore(state, device)
      const cleanNights = inGrace ? device.cleanNights + 1 : device.cleanNights
      const score = clampScore(inGrace ? base + RECOVERY_PER_CLEAN_NIGHT : base)
      const updated: Device = {
        ...device,
        state: 'off',
        currentWatts: 0,
        asleepSince: null,
        atRisk: false,
        stewardshipScore: Math.round(score * 10) / 10,
        cleanNights,
        wattHistory: pushHistory(device, 0),
      }
      const nextRuntime = { ...state.runtime }
      delete nextRuntime[device.id]
      const stillAsleep = state.devices.some(
        (d) => d.id !== device.id && d.state === 'asleep' && d.ownerId === CURRENT_USER_ID,
      )
      return {
        ...state,
        running: stillAsleep,
        devices: state.devices.map((d) => (d.id === updated.id ? updated : d)),
        runtime: nextRuntime,
        celebration: {
          id: state.celebrationSeq + 1,
          kind: 'up',
          headline: 'Caught it',
          figure: `${Math.round(device.standbyWatts * (minutesUntilMorning(state.clock) / 60))} Wh`,
          detail: `saved · ${cleanNights} nights clean`,
        },
        celebrationSeq: state.celebrationSeq + 1,
        confirmation: {
          deviceId: device.id,
          pointsReturned: Math.round(drained * 10) / 10,
          cleanNights,
          score: updated.stewardshipScore,
          playing: true,
        },
        feed: [
          event(
            `f-off-${device.id}`,
            state.clock,
            'powered-off',
            CURRENT_USER_ID,
            device.id,
            0,
            `You got the ${device.name}. ${cleanNights} nights clean.`,
          ),
          ...state.feed,
        ],
      }
    }

    // --- Beat 7: fourteen hours of standby, settled at 08:00 ---------------
    case 'advance-to-morning': {
      const asleep = state.devices.filter((d) => d.state === 'asleep' && d.ownerId !== null)
      if (asleep.length === 0) return state
      const minutes = minutesUntilMorning(state.clock)
      const morningClock = state.clock + minutes
      let settlement: MorningSettlement | null = null
      const newEvents: FeedEvent[] = []
      const runtime = { ...state.runtime }

      const samples = Math.round(minutes / 30)
      const devices = state.devices.map((device) => {
        if (device.state !== 'asleep' || device.ownerId === null) {
          return {
            ...device,
            wattHistory: extendPlateau(device, device.currentWatts, samples),
          }
        }
        const rt = state.runtime[device.id]
        const sleptHours = (morningClock - (device.asleepSince ?? state.clock)) / 60
        const before = rt ? rt.scoreAtSleep : device.stewardshipScore
        // Nightly settlement rounds to whole points.
        const drain = Math.round(drainPoints(device.standbyWatts, sleptHours))
        const after = clampScore(before - drain - AT_RISK_PENALTY)
        if (device.ownerId === CURRENT_USER_ID && !settlement) {
          settlement = {
            deviceId: device.id,
            hours: Math.round(sleptHours),
            wattHours: Math.round(device.standbyWatts * sleptHours),
            drain,
            penalty: AT_RISK_PENALTY,
            before,
            after,
          }
        }
        newEvents.push(
          event(
            `f-night-${device.id}`,
            morningClock,
            'left-asleep',
            device.ownerId,
            device.id,
            -(drain + AT_RISK_PENALTY),
            `The ${device.name} idled all night. ${drain + AT_RISK_PENALTY} points, and it is up for grabs.`,
          ),
        )
        runtime[device.id] = {
          scoreAtSleep: after,
          graceStart: null,
          drainFrom: morningClock,
        }
        return {
          ...device,
          stewardshipScore: after,
          atRisk: true,
          cleanNights: 0,
          nightsLeftAsleep: device.nightsLeftAsleep + 1,
          wattHistory: extendPlateau(device, device.standbyWatts, samples),
        }
      })

      return {
        ...state,
        clock: morningClock,
        running: false,
        devices,
        runtime,
        settlement,
        celebration: settlement
          ? {
              id: state.celebrationSeq + 1,
              kind: 'down' as const,
              headline: 'Idled all night',
              figure: `−${(settlement as MorningSettlement).drain + (settlement as MorningSettlement).penalty}`,
              detail: `${formatScore((settlement as MorningSettlement).before)} → ${formatScore((settlement as MorningSettlement).after)} · get it back tonight`,
            }
          : null,
        celebrationSeq: state.celebrationSeq + 1,
        feed: [...newEvents, ...state.feed],
      }
    }

    // --- Beat 8: someone else takes the at-risk device --------------------
    case 'rival-adopts': {
      const target = state.devices.find((d) => d.atRisk && d.ownerId === CURRENT_USER_ID)
      if (!target) return state
      const rival = SEED_USERS.find((u) => u.id === RIVAL_ID)!
      const devices = state.devices.map((d) =>
        d.id === target.id ? { ...d, ownerId: RIVAL_ID, atRisk: false } : d,
      )
      return {
        ...state,
        devices,
        settlement: null,
        openDeviceId: null,
    myReactions: {},
    celebration: null,
    celebrationSeq: 0,
        notice: {
          id: `n-steal-${target.id}`,
          title: `${rival.name} took your printer`,
          body: 'It went at-risk this morning. Take it back if she slips.',
          tone: 'standby',
        },
        feed: [
          event(
            `f-steal-${target.id}`,
            state.clock,
            'steal',
            RIVAL_ID,
            target.id,
            0,
            `${rival.name} took your printer. She is 6 points ahead and now she owns it.`,
          ),
          ...state.feed,
        ],
      }
    }

    // --- Beat 9: a day passes ---------------------------------------------
    case 'advance-day': {
      const nextClock = state.clock + 1440
      const devices = state.devices.map((d, i) => {
        const clean = d.ownerId === CURRENT_USER_ID && d.state !== 'asleep'
        const history = buildHistory(
          clean || d.neglectRating < 4 ? 'clean' : 'leaky',
          d.activeWatts,
          d.standbyWatts,
          9000 + state.day * 971 + i * 37,
          d.type === 'kettle',
        )
        history[history.length - 1] = d.currentWatts
        if (!clean) return { ...d, wattHistory: history }
        return {
          ...d,
          wattHistory: history,
          cleanNights: d.cleanNights + 1,
          stewardshipScore: clampScore(d.stewardshipScore + RECOVERY_PER_CLEAN_NIGHT),
        }
      })
      const memberScores = Object.fromEntries(
        Object.entries(state.memberScores).map(([id, score]) => [
          id,
          clampScore(score + (DAY_ONE_DELTAS[id] ?? 0)),
        ]),
      )
      const owned = devices.filter((d) => d.ownerId === CURRENT_USER_ID)
      const newEvents = [
        event(
          `f-day-${state.day}-a`,
          nextClock,
          'streak',
          CURRENT_USER_ID,
          owned[0]?.id ?? null,
          RECOVERY_PER_CLEAN_NIGHT,
          `Everything you watch hit 0W overnight. You moved up.`,
        ),
        event(
          `f-day-${state.day}-b`,
          nextClock - 40,
          'left-asleep',
          'u-marcus',
          'e4-printer',
          -2.2,
          `Marcus leaked again. Fourth night running.`,
        ),
      ]
      return {
        ...state,
        clock: nextClock,
        day: state.day + 1,
        devices,
        memberScores,
        celebration: {
          id: state.celebrationSeq + 1,
          kind: 'up',
          headline: 'All clean overnight',
          figure: `+${RECOVERY_PER_CLEAN_NIGHT}`,
          detail: 'on every device you watch · you climbed the board',
        },
        celebrationSeq: state.celebrationSeq + 1,
        feed: [...newEvents, ...state.feed],
      }
    }

    // --- Adopt tab ---------------------------------------------------------
    case 'adopt': {
      const device = state.devices.find((d) => d.id === action.deviceId)
      if (!device || device.ownerId !== null) return state
      const devices = state.devices.map((d) =>
        d.id === device.id ? { ...d, ownerId: CURRENT_USER_ID, atRisk: false } : d,
      )
      return {
        ...state,
        devices,
        notice: {
          id: `n-adopt-${device.id}`,
          title: `You adopted the ${device.name}`,
          body: `Idle ${device.nightsLeftAsleep} of the last ${device.nightsTracked} nights. It is yours now.`,
          tone: 'live',
        },
        feed: [
          event(
            `f-claim-${device.id}`,
            state.clock,
            'claim',
            CURRENT_USER_ID,
            device.id,
            0,
            `You took the ${device.name}. Idle ${device.nightsLeftAsleep} of the last ${device.nightsTracked} nights.`,
          ),
          ...state.feed,
        ],
      }
    }

    case 'create-league':
      return {
        ...state,
        createdLeague: { name: action.name, code: action.code },
      }

    case 'reset':
      // Keep the panel where the operator left it — this runs between takes.
      return { ...initialState(), panelOpen: state.panelOpen }

    default:
      return state
  }
}

interface Store {
  state: DemoState
  dispatch: React.Dispatch<Action>
  devices: Device[]
  owned: Device[]
  you: number
  leagues: typeof SEED_LEAGUES
}

const DemoContext = createContext<Store | null>(null)

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)
  const frame = useRef<number>(0)

  // One demo second is one campus minute. The clock only runs while a device
  // is asleep and unresolved — waiting is the only thing worth compressing.
  // setInterval, not requestAnimationFrame: rAF stops when the window loses
  // focus, and the presenter will alt-tab.
  useEffect(() => {
    if (!state.running) return
    let last = performance.now()
    const id = setInterval(() => {
      const now = performance.now()
      const elapsed = (now - last) / 1000
      last = now
      dispatch({ type: 'tick', minutes: elapsed })
    }, 250)
    frame.current = id as unknown as number
    return () => clearInterval(id)
  }, [state.running])

  // A moment holds for 2.6s, then gets out of the way on its own.
  useEffect(() => {
    if (!state.celebration) return
    const t = setTimeout(() => dispatch({ type: 'clear-celebration' }), 2600)
    return () => clearTimeout(t)
  }, [state.celebration?.id])

  // Let the power-off animation play, then settle.
  useEffect(() => {
    if (!state.confirmation?.playing) return
    const t = setTimeout(() => dispatch({ type: 'end-confirmation' }), 1500)
    return () => clearTimeout(t)
  }, [state.confirmation?.playing, state.confirmation?.deviceId])

  const devices = state.devices
  const owned = useMemo(
    () => devices.filter((d) => d.ownerId === CURRENT_USER_ID),
    [devices],
  )
  const you = useMemo(
    () =>
      watchScore(
        owned.map((d) => ({ ...d, stewardshipScore: liveScore(state, d) })),
      ),
    [owned, state],
  )

  const value = useMemo<Store>(
    () => ({ state, dispatch, devices, owned, you, leagues: SEED_LEAGUES }),
    [state, devices, owned, you],
  )

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemo(): Store {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemo must be used inside DemoProvider')
  return ctx
}

/** Keyboard: D toggles the operator panel, Shift+R resets. */
export function useDemoKeys() {
  const { dispatch } = useDemo()
  const handler = useCallback(
    (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return
      if (e.key === 'd' || e.key === 'D') dispatch({ type: 'toggle-panel' })
      if (e.key === 'Escape') dispatch({ type: 'toggle-panel', open: false })
      if (e.key === 'R' && e.shiftKey) dispatch({ type: 'reset' })
    },
    [dispatch],
  )
  useEffect(() => {
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handler])
}

export { NIGHT_END_INDEX }
