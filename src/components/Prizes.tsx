import type { Row } from '../demo/leaderboard'
import { formatScore } from '../demo/scoring'

/** This term's campus pot. Hardcoded — it is the reason to climb. */
export const PRIZES = [
  { place: 1, medal: '🥇', prize: 'AirPods Pro', sub: '+ $300 credit' },
  { place: 2, medal: '🥈', prize: '$150 credit', sub: 'campus stores' },
  { place: 3, medal: '🥉', prize: '$75 credit', sub: 'campus stores' },
]

export default function Prizes({ rows, rank }: { rows: Row[]; rank: number }) {
  const third = rows[2]
  const you = rows.find((r) => r.isYou)
  const gap = third && you ? Math.round((third.score - you.score) * 10) / 10 : 0
  const inMoney = rank <= 3

  return (
    <section
      className="anim-rise overflow-hidden rounded-[16px]"
      style={{
        background:
          'linear-gradient(138deg, #FFF9EE 0%, #FCEEDA 44%, #F6E0C4 100%)',
        boxShadow:
          'inset 0 0 0 1px rgba(184,134,47,0.28), 0 14px 30px -22px rgba(184,134,47,0.7)',
      }}
    >
      {/* a slow sheen, the only thing in the app that glints */}
      <span
        className="sheen pointer-events-none absolute inset-y-0 w-1/3"
        style={{
          background:
            'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.65) 50%, rgba(255,255,255,0) 100%)',
        }}
      />
      <div className="relative px-4 pt-3.5 pb-4">
        <div className="flex items-center justify-between">
          <span
            className="u-eyebrow text-[9px]"
            style={{ color: '#9A7326' }}
          >
            Semester 1 pot
          </span>
          <span className="u-num text-[11px]" style={{ color: '#A08A63' }}>
            Ends 12 Dec
          </span>
        </div>

        <p
          className="u-serif mt-1.5 text-[21px] leading-tight"
          style={{ color: '#4A3512' }}
        >
          Top three take it home.
        </p>

        <div className="mt-3.5 flex flex-col gap-1.5">
          {PRIZES.map((p) => {
            const holder = rows[p.place - 1]
            const isYou = holder?.isYou
            return (
              <div
                key={p.place}
                className="flex items-center gap-2.5 rounded-[10px] px-3 py-2"
                style={{
                  background: isYou
                    ? 'rgba(184,134,47,0.22)'
                    : 'rgba(255,255,255,0.66)',
                  boxShadow: isYou
                    ? 'inset 0 0 0 1px rgba(184,134,47,0.5)'
                    : 'inset 0 0 0 1px rgba(184,134,47,0.13)',
                }}
              >
                <span style={{ fontSize: 15 }}>{p.medal}</span>
                <span className="min-w-0 flex-1">
                  <span
                    className="block truncate text-[13px]"
                    style={{ color: '#3B2A0E' }}
                  >
                    {p.prize}
                  </span>
                  <span
                    className="u-num block truncate text-[10.5px]"
                    style={{ color: '#A08A63' }}
                  >
                    {holder ? (isYou ? 'You' : holder.name) : p.sub}
                  </span>
                </span>
                <span
                  className="u-serif u-num shrink-0 text-[17px] leading-none"
                  style={{ color: '#9A7326' }}
                >
                  {holder ? formatScore(holder.score) : '—'}
                </span>
              </div>
            )
          })}
        </div>

        <div
          className="mt-3 rounded-[10px] px-3 py-2.5"
          style={{ background: 'rgba(184,134,47,0.16)' }}
        >
          <p className="u-num text-[12.5px]" style={{ color: '#7A5A16' }}>
            {inMoney
              ? 'You are in the money. Do not let it slip.'
              : `${formatScore(gap)} points off third place.`}
          </p>
        </div>
      </div>
    </section>
  )
}
