import DeviceRow from '../components/DeviceRow'
import IdleAlert from '../components/IdleAlert'
import { SEED_USERS } from '../data/users'
import {
  CAMPUS_LEAGUE_ID,
  GREMLINS_LEAGUE_ID,
  buildLeaderboard,
  yourRank,
} from '../demo/leaderboard'
import { formatScore } from '../demo/scoring'
import { useCountUp } from '../demo/useCountUp'
import { useDemo } from '../demo/store'
import { PRIZES } from '../components/Prizes'
import ScoreBulb from '../components/ScoreBulb'

const USERS = new Map(SEED_USERS.map((u) => [u.id, u]))

const TILE_TONES = {
  mint: { bg: 'linear-gradient(160deg, #EDF6F1 0%, #E2F0E9 100%)', fg: '#2F6B52', ring: 'rgba(47,107,82,0.16)' },
  lilac: { bg: 'linear-gradient(160deg, #F2EEF9 0%, #E9E2F4 100%)', fg: '#5B4A7D', ring: 'rgba(91,74,125,0.16)' },
  amber: { bg: 'linear-gradient(160deg, #FBEEDE 0%, #F5E1CB 100%)', fg: '#A8611F', ring: 'rgba(168,97,31,0.2)' },
  plain: { bg: 'var(--color-card)', fg: 'var(--color-ink)', ring: 'var(--color-line)' },
} as const

function Tile({
  value,
  label,
  tone,
}: {
  value: string
  label: string
  tone: keyof typeof TILE_TONES
}) {
  const t = TILE_TONES[tone]
  return (
    <div
      className="flex-1 rounded-[13px] px-3 py-3"
      style={{ background: t.bg, boxShadow: `inset 0 0 0 1px ${t.ring}` }}
    >
      <p className="u-serif u-num text-[25px] leading-none" style={{ color: t.fg }}>
        {value}
      </p>
      <p className="u-eyebrow mt-1.5 text-[9px]">{label}</p>
    </div>
  )
}

export default function WatchTab() {
  const { state, dispatch, owned, you } = useDemo()
  const rows = buildLeaderboard(state, CAMPUS_LEAGUE_ID, you)
  const rank = yourRank(rows)
  const idle = owned.find((d) => d.state === 'asleep' && !d.atRisk)
  const shown = useCountUp(you)

  const streak = owned.reduce((m, d) => Math.max(m, d.cleanNights), 0)
  // Everything still drawing standby right now, across campus.
  const idlingDevices = state.devices.filter((d) => d.state === 'asleep')
  const idlingWatts = idlingDevices.reduce((sum, d) => sum + d.currentWatts, 0)
  const overnightKwh = Math.round((idlingWatts * 14) / 100) / 10

  // The rival worth chasing is the one you know — the person one place above
  // you in your private league, not a stranger on a 100-person board.
  const gremlins = buildLeaderboard(state, GREMLINS_LEAGUE_ID, you)
  const meIndex = gremlins.findIndex((r) => r.isYou)
  const target = meIndex > 0 ? gremlins[meIndex - 1] : null
  const gap = target ? Math.round((target.score - you) * 10) / 10 : 0
  const chase = target ? USERS.get(target.id) : null

  // How far off the campus podium — the prize teaser's whole point.
  const third = rows[2]
  const podiumGap = third ? Math.round((third.score - you) * 10) / 10 : 0

  return (
    <div className="px-5 pb-8">
      {idle && <IdleAlert device={idle} />}

      <section
        className={`${idle ? 'mt-5' : 'mt-1'} rounded-[16px] px-4 py-4`}
        style={{
          background:
            'linear-gradient(150deg, #FFFFFF 0%, #FBFCFD 42%, #F4F7FA 100%)',
          boxShadow:
            'inset 0 0 0 1px var(--color-line), 0 10px 26px -22px rgba(20,22,26,0.4)',
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="u-eyebrow">Watch Score</p>
            <div className="mt-1 flex items-baseline gap-2.5">
              <span className="u-serif u-num text-[54px] leading-none">
                {formatScore(shown)}
              </span>
              <span
                className="u-num rounded-full px-2.5 py-[3px] text-[11px]"
                style={{
                  background: 'linear-gradient(120deg, #E4F1EA 0%, #D9EBE1 100%)',
                  color: '#2F6B52',
                }}
              >
                ▲ 3 this week
              </span>
            </div>
            <p className="mt-2.5 text-[12.5px]" style={{ color: 'var(--color-muted)' }}>
              {formatScore(100 - you)} points off a perfect campus record.
            </p>
          </div>
          <div className="shrink-0 pt-0.5">
            <ScoreBulb score={shown} />
          </div>
        </div>
      </section>

      <div className="mt-4 flex gap-2">
        <Tile value={String(streak)} label="Night streak" tone="mint" />
        <Tile value={`#${rank}`} label="Campus rank" tone="lilac" />
        <Tile
          value={`${idlingWatts}W`}
          label="Idling now"
          tone={idlingWatts > 0 ? 'amber' : 'plain'}
        />
      </div>

      {/* the reason to climb, on the screen people actually land on */}
      <button
        type="button"
        onClick={() => dispatch({ type: 'set-tab', tab: 'leagues' })}
        className="anim-rise relative mt-3 flex w-full items-center gap-3 overflow-hidden rounded-[14px] px-4 py-3 text-left"
        style={{
          background: 'linear-gradient(130deg, #FFF9EE 0%, #FBEBD4 55%, #F5DFC2 100%)',
          boxShadow: 'inset 0 0 0 1px rgba(184,134,47,0.28)',
        }}
      >
        <span
          className="sheen pointer-events-none absolute inset-y-0 w-1/3"
          style={{
            background:
              'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%)',
          }}
        />
        <span className="relative" style={{ fontSize: 19 }}>
          🥇
        </span>
        <span className="relative min-w-0 flex-1">
          <span className="u-serif block text-[15px] leading-tight" style={{ color: '#3B2A0E' }}>
            {podiumGap > 0
              ? `${formatScore(podiumGap)} points off ${PRIZES[0].prize}`
              : `You are holding ${PRIZES[0].prize}`}
          </span>
          <span className="u-num mt-0.5 block text-[11.5px]" style={{ color: '#A08A63' }}>
            Campus pot closes 12 Dec
          </span>
        </span>
        <span className="relative text-[15px]" style={{ color: '#9A7326' }}>
          ›
        </span>
      </button>

      {chase && (
        <section
          className="mt-3 rounded-[13px] px-4 py-3.5"
          style={{ background: 'var(--color-card)' }}
        >
          <div className="flex items-center justify-between">
            <p className="u-eyebrow">Next to catch · Gremlins</p>
            <p className="u-num text-[12px]" style={{ color: 'var(--color-amber)' }}>
              {formatScore(gap)} ahead
            </p>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <span
              className="u-num flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px]"
              style={{ background: 'var(--color-faint)', color: 'var(--color-muted)' }}
            >
              {chase.initials}
            </span>
            <span className="min-w-0 flex-1 truncate text-[14.5px]">{chase.name}</span>
            <span className="u-serif u-num text-[20px] leading-none">
              {formatScore(target!.score)}
            </span>
          </div>
          <div
            className="mt-2.5 h-[4px] w-full overflow-hidden rounded-full"
            style={{ background: 'var(--color-faint)' }}
          >
            <div
              className="anim-bar h-full rounded-full"
              style={{
                width: `${Math.max(4, (you / target!.score) * 100)}%`,
                background: 'var(--color-amber)',
              }}
            />
          </div>
        </section>
      )}

      <div className="mt-6">
        <p className="u-eyebrow">Your devices</p>
        <div className="mt-1">
          {owned.map((device, i) => (
            <div
              key={device.id}
              style={i > 0 ? { borderTop: '1px solid var(--color-line)' } : undefined}
            >
              <DeviceRow device={device} />
            </div>
          ))}
        </div>
        {owned.length === 0 && (
          <p className="py-8 text-center text-[13px]" style={{ color: 'var(--color-muted)' }}>
            Nothing on your Watch. Adopt something.
          </p>
        )}
      </div>

      <section
        className="mt-5 rounded-[13px] px-4 py-3.5"
        style={{ background: 'var(--color-card)' }}
      >
        <p className="u-eyebrow">Campus right now</p>
        <p className="u-serif mt-1.5 text-[17px] leading-snug">
          <span className="u-num">{idlingWatts}W</span> idling across{' '}
          <span className="u-num">{idlingDevices.length}</span> devices.
        </p>
        <p className="mt-1 text-[12.5px]" style={{ color: 'var(--color-muted)' }}>
          {overnightKwh} kWh by 8am if nobody moves. Using them is free — only
          standby costs.
        </p>
      </section>
    </div>
  )
}
