import { useEffect, useRef, useState } from 'react'
import { SEED_LEAGUES, VALID_JOIN_CODE } from '../data/users'
import { buildLeaderboard, yourRank, type Row } from '../demo/leaderboard'
import { formatScore } from '../demo/scoring'
import { useDemo } from '../demo/store'
import Prizes from '../components/Prizes'

function LeaderRow({ row, divider }: { row: Row; divider?: boolean }) {
  return (
    <div
      className="flex items-center gap-3 py-2.5"
      style={{
        borderTop: divider ? '1px solid var(--color-line)' : undefined,
        background: row.isYou ? 'var(--color-faint)' : undefined,
        paddingInline: row.isYou ? 12 : 0,
        marginInline: row.isYou ? -12 : 0,
        borderRadius: row.isYou ? 10 : undefined,
      }}
    >
      <span
        className="u-num w-6 shrink-0 text-right text-[13px]"
        style={{ color: 'var(--color-muted)' }}
      >
        {row.rank}
      </span>
      <span className="min-w-0 flex-1 truncate text-[14.5px]">
        {row.isYou ? 'You' : row.name}
      </span>
      <span className="u-serif u-num shrink-0 text-[19px] leading-none">
        {formatScore(row.score)}
      </span>
    </div>
  )
}

export default function LeaguesTab() {
  const { state, dispatch, you } = useDemo()
  const [tab, setTab] = useState(state.activeLeagueId)
  const [sheet, setSheet] = useState(false)
  const [code, setCode] = useState('')
  const [codeState, setCodeState] = useState<'idle' | 'ok' | 'bad'>('idle')
  const youRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [youVisible, setYouVisible] = useState(true)
  const [overflows, setOverflows] = useState(false)

  const league = SEED_LEAGUES.find((l) => l.id === tab)!
  const rows = buildLeaderboard(state, tab, you)
  const rank = yourRank(rows)
  const yourRow = rows.find((r) => r.isYou)
  const leader = rows[0]
  const gap = yourRow && leader ? Math.round((leader.score - yourRow.score) * 10) / 10 : 0

  useEffect(() => {
    const root = listRef.current
    const target = youRef.current
    setYouVisible(true)
    if (!root || !target) return
    setOverflows(root.scrollHeight > root.clientHeight + 4)
    const io = new IntersectionObserver(([e]) => setYouVisible(e.isIntersecting), {
      root,
      threshold: 0.9,
    })
    io.observe(target)
    return () => io.disconnect()
  }, [tab, rows.length])

  return (
    <div className="px-5 pb-8">
      <h2 className="u-serif text-[26px] leading-none">Leagues</h2>

      <div
        className="mt-4 flex rounded-full p-[3px]"
        style={{ background: 'var(--color-faint)' }}
      >
        {SEED_LEAGUES.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => {
              setTab(l.id)
              dispatch({ type: 'set-league', leagueId: l.id })
            }}
            className="flex-1 rounded-full py-1.5 text-[13px]"
            style={{
              background: tab === l.id ? 'var(--color-card)' : 'transparent',
              color: tab === l.id ? 'var(--color-ink)' : 'var(--color-muted)',
              boxShadow: tab === l.id ? '0 1px 2px rgba(20,22,26,0.08)' : undefined,
            }}
          >
            {l.kind === 'campus' ? 'Campus' : 'Gremlins'}
          </button>
        ))}
      </div>

      {league.kind === 'campus' && (
        <div className="mt-4">
          <Prizes rows={rows} rank={rank} />
        </div>
      )}

      <div className="mt-4 flex items-baseline gap-3">
        <span className="u-serif u-num text-[38px] leading-none">{rank}</span>
        <span className="u-num text-[13px]" style={{ color: 'var(--color-muted)' }}>
          of {rows.length}
        </span>
      </div>
      <p
        className="u-num mt-1.5 text-[13px]"
        style={{ color: gap > 0 ? 'var(--color-amber)' : 'var(--color-muted)' }}
      >
        {gap > 0 ? `${formatScore(gap)} behind ${leader.name.split(' ')[0]}` : 'Top of the board'}
      </p>

      <div ref={listRef} className="scroll-y mt-3" style={{ maxHeight: 208 }}>
        {rows.map((row, i) => (
          <div key={row.id} ref={row.isYou ? youRef : undefined}>
            <LeaderRow row={row} divider={i > 0} />
          </div>
        ))}
      </div>
      {overflows && !youVisible && yourRow && (
        <div
          className="border-t pt-1"
          style={{ borderColor: 'var(--color-line)', background: 'var(--color-paper)' }}
        >
          <LeaderRow row={yourRow} />
        </div>
      )}

      <button
        type="button"
        onClick={() => setSheet(true)}
        className="mt-4 w-full rounded-[11px] border py-2.5 text-[14px]"
        style={{ borderColor: 'var(--color-line)', color: 'var(--color-muted)' }}
      >
        Join or create a league
      </button>

      {sheet && (
        <div className="absolute inset-0 z-40 flex flex-col justify-end">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setSheet(false)}
            className="anim-veil absolute inset-0"
            style={{ background: 'rgba(20,22,26,0.28)' }}
          />
          <div
            className="anim-sheet relative rounded-t-[20px] px-5 pt-4 pb-7"
            style={{ background: 'var(--color-card)' }}
          >
            <div
              className="mx-auto mb-4 h-[3px] w-9 rounded-full"
              style={{ background: 'var(--color-line)' }}
            />
            {state.createdLeague ? (
              <div className="text-center">
                <h3 className="u-serif text-[22px]">{state.createdLeague.name}</h3>
                <p className="u-eyebrow mt-3">Join code</p>
                <p className="u-serif u-num mt-1 text-[38px] tracking-[0.1em]">
                  {state.createdLeague.code}
                </p>
                <div className="mt-4 flex gap-2">
                  {['Messages', 'WhatsApp', 'Telegram', 'Copy'].map((s) => (
                    <div
                      key={s}
                      className="flex-1 rounded-[10px] py-2.5 text-[11px]"
                      style={{ background: 'var(--color-faint)', color: 'var(--color-muted)' }}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <h3 className="u-serif text-[22px]">Join a league</h3>
                <div className="mt-3 flex gap-2">
                  <input
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase())
                      setCodeState('idle')
                    }}
                    placeholder="GREMLIN"
                    aria-label="Join code"
                    className="u-num min-w-0 flex-1 rounded-[10px] border px-3.5 py-2.5 text-[15px] tracking-[0.08em] outline-none"
                    style={{
                      borderColor:
                        codeState === 'bad' ? 'var(--color-amber)' : 'var(--color-line)',
                      background: 'var(--color-card)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setCodeState(code.trim() === VALID_JOIN_CODE ? 'ok' : 'bad')}
                    className="rounded-[10px] px-5 text-[14px]"
                    style={{ background: 'var(--color-ink)', color: 'var(--color-card)' }}
                  >
                    Join
                  </button>
                </div>
                {codeState === 'ok' && (
                  <p className="anim-rise mt-2.5 text-[13px]">
                    You are already in {league.name}.
                  </p>
                )}
                {codeState === 'bad' && (
                  <p
                    className="anim-rise mt-2.5 text-[13px]"
                    style={{ color: 'var(--color-amber)' }}
                  >
                    No league with that code.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() =>
                    dispatch({ type: 'create-league', name: 'E4 Night Shift', code: 'NIGHTS' })
                  }
                  className="mt-4 w-full rounded-[11px] border py-2.5 text-[14px]"
                  style={{ borderColor: 'var(--color-line)' }}
                >
                  Create a league instead
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
