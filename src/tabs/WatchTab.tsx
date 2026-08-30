import { useState } from 'react'
import DeviceRow from '../components/DeviceRow'
import Duel from '../components/Duel'
import IdleAlert from '../components/IdleAlert'
import { PRIZES } from '../components/Prizes'
import ScoreBulb from '../components/ScoreBulb'
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

const USERS = new Map(SEED_USERS.map((u) => [u.id, u]))

export default function WatchTab() {
  const { state, dispatch, owned, you } = useDemo()
  const rows = buildLeaderboard(state, CAMPUS_LEAGUE_ID, you)
  const rank = yourRank(rows)
  const idle = owned.find((d) => d.state === 'asleep' && !d.atRisk)
  const shown = useCountUp(you)
  const [flick, setFlick] = useState(0)

  const idlingDevices = state.devices.filter((d) => d.state === 'asleep')
  const idlingWatts = idlingDevices.reduce((sum, d) => sum + d.currentWatts, 0)

  const gremlins = buildLeaderboard(state, GREMLINS_LEAGUE_ID, you)
  const meIndex = gremlins.findIndex((r) => r.isYou)
  const rival = meIndex > 0 ? gremlins[meIndex - 1] : null
  const rivalUser = rival ? USERS.get(rival.id) : null

  const third = rows[2]
  const podiumGap = third ? Math.round((third.score - you) * 10) / 10 : 0

  return (
    <div className="px-5 pb-8">
      {idle && <IdleAlert device={idle} />}

      {/* --- the bulb is the game object ---------------------------------- */}
      <section
        className={`${idle ? 'mt-5' : 'mt-1'} relative overflow-hidden rounded-[20px] px-5 pt-5 pb-5 text-center`}
        style={{
          background:
            'radial-gradient(90% 65% at 50% 8%, #FFFBF3 0%, #FDF6EB 38%, #F6F8FA 100%)',
          boxShadow:
            'inset 0 0 0 1px var(--color-line), 0 12px 30px -24px rgba(20,22,26,0.45)',
        }}
      >
        <button
          type="button"
          aria-label="Flick the bulb"
          onClick={() => setFlick((n) => n + 1)}
          className="relative mx-auto block"
        >
          {flick > 0 && (
            <span
              key={flick}
              className="flare pointer-events-none absolute rounded-full"
              style={{
                left: '50%',
                top: '38%',
                width: 130,
                height: 130,
                marginLeft: -65,
                marginTop: -65,
                background:
                  'radial-gradient(circle, rgba(230,188,114,0.75) 0%, rgba(230,188,114,0) 70%)',
              }}
            />
          )}
          <span key={`b-${flick}`} className={flick > 0 ? 'bulb-pop block' : 'block'}>
            <ScoreBulb score={shown} size={132} />
          </span>
        </button>

        <p className="u-serif u-num mt-1 text-[46px] leading-none">
          {formatScore(shown)}
        </p>
        <p className="u-eyebrow mt-2">
          Watch Score · #{rank} on campus
        </p>
        <p className="mt-2.5 text-[13px]" style={{ color: 'var(--color-muted)' }}>
          {formatScore(100 - you)} points off a perfect record.
        </p>
      </section>

      {rival && rivalUser && (
        <div className="mt-5">
          <Duel you={you} rival={rival} rivalInitials={rivalUser.initials} />
        </div>
      )}

      <button
        type="button"
        onClick={() => dispatch({ type: 'set-tab', tab: 'leagues' })}
        className="relative mt-3 flex w-full items-center gap-3 overflow-hidden rounded-[14px] px-4 py-3.5 text-left"
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
        <span className="relative" style={{ fontSize: 20 }}>
          🥇
        </span>
        <span className="relative min-w-0 flex-1">
          <span className="u-serif block text-[15.5px] leading-tight" style={{ color: '#3B2A0E' }}>
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

      <div className="mt-6">
        <p className="u-eyebrow">Under your watch</p>
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

      {idlingDevices.length > 0 && (
        <button
          type="button"
          onClick={() => dispatch({ type: 'set-tab', tab: 'adopt' })}
          className="mt-5 flex w-full items-center gap-3 rounded-[14px] px-4 py-3.5 text-left"
          style={{
            background: 'var(--color-amber-soft)',
            boxShadow: 'inset 0 0 0 1px rgba(168,97,31,0.22)',
          }}
        >
          <span
            className="anim-breathe block h-[7px] w-[7px] shrink-0 rounded-full"
            style={{ background: 'var(--color-amber)' }}
          />
          <span className="min-w-0 flex-1">
            <span className="u-serif block text-[15.5px] leading-tight">
              <span className="u-num">{idlingDevices.length}</span> devices are
              bleeding right now
            </span>
            <span className="u-num mt-0.5 block text-[11.5px]" style={{ color: 'var(--color-amber)' }}>
              {idlingWatts}W across campus · nobody is watching them
            </span>
          </span>
          <span className="text-[15px]" style={{ color: 'var(--color-amber)' }}>
            ›
          </span>
        </button>
      )}
    </div>
  )
}
