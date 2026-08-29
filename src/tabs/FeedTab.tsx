import { SEED_USERS } from '../data/users'
import type { FeedEvent } from '../data/types'
import { timeOfDay } from '../demo/clock'
import { baseCounts } from '../demo/reactions'
import { useDemo } from '../demo/store'

const USERS = new Map(SEED_USERS.map((u) => [u.id, u]))

const TAG: Record<FeedEvent['kind'], { label: string; warm: boolean }> = {
  'powered-off': { label: 'Caught it', warm: false },
  'left-asleep': { label: 'Leaked', warm: true },
  steal: { label: 'Stolen', warm: true },
  claim: { label: 'Adopted', warm: false },
  streak: { label: 'Streak', warm: false },
}

/** Deterministic avatar tints so each Gremlin is recognisable at a glance. */
const TINT: Record<string, string> = {
  'u-priya': '#E8DCF2',
  'u-marcus': '#DDE7F2',
  'u-rachel': '#DCEDE4',
  'u-sanchit': '#14161A',
}

function Reactions({ event }: { event: FeedEvent }) {
  const { state, dispatch } = useDemo()
  const mine = state.myReactions[event.id] ?? []

  return (
    <div className="mt-2.5 flex flex-wrap gap-1.5">
      {baseCounts(event.id, event.kind).map(([emoji, base]) => {
        const on = mine.includes(emoji)
        return (
          <button
            key={emoji}
            type="button"
            aria-pressed={on}
            onClick={() => dispatch({ type: 'react', eventId: event.id, emoji })}
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] transition-transform active:scale-90"
            style={{
              background: on ? 'var(--color-amber-soft)' : 'var(--color-faint)',
              boxShadow: on ? 'inset 0 0 0 1px rgba(168,97,31,0.4)' : 'none',
            }}
          >
            <span style={{ fontSize: 13 }}>{emoji}</span>
            <span
              className="u-num"
              style={{ color: on ? 'var(--color-amber)' : 'var(--color-muted)' }}
            >
              {base + (on ? 1 : 0)}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default function FeedTab() {
  const { state } = useDemo()

  return (
    <div className="px-5 pb-8">
      <div className="flex items-baseline justify-between">
        <h2 className="u-serif text-[26px] leading-none">Feed</h2>
        <span className="u-eyebrow text-[10px]">4 members</span>
      </div>
      <p className="mt-1.5 text-[13px]" style={{ color: 'var(--color-muted)' }}>
        COM1 Gremlins. What everyone did about it.
      </p>

      <div className="mt-4 flex flex-col gap-2.5">
        {state.feed.map((e, i) => {
          const actor = USERS.get(e.actorId)
          const tag = TAG[e.kind]
          const you = e.actorId === 'u-sanchit'
          return (
            <article
              key={e.id}
              className="anim-rise rounded-[15px] px-4 py-3.5"
              style={{
                // Stagger the entrance so the list deals itself in.
                animationDelay: `${Math.min(i, 7) * 55}ms`,
                background: tag.warm
                  ? 'linear-gradient(180deg, #FBF3EA 0%, #FFFFFF 62%)'
                  : 'var(--color-card)',
                boxShadow: tag.warm
                  ? 'inset 0 0 0 1px rgba(168,97,31,0.16)'
                  : 'inset 0 0 0 1px var(--color-line)',
              }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="u-num flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px]"
                  style={{
                    background: TINT[e.actorId] ?? 'var(--color-faint)',
                    color: you ? '#FFFFFF' : 'var(--color-ink)',
                  }}
                >
                  {actor ? actor.initials : '··'}
                </span>
                <span
                  className="u-eyebrow text-[9px]"
                  style={{ color: tag.warm ? 'var(--color-amber)' : 'var(--color-muted)' }}
                >
                  {tag.label}
                </span>
                {e.scoreDelta !== 0 && (
                  <span
                    className="u-num rounded-full px-2 py-[2px] text-[10.5px]"
                    style={{
                      background: e.scoreDelta < 0 ? 'rgba(168,97,31,0.13)' : 'var(--color-faint)',
                      color: e.scoreDelta < 0 ? 'var(--color-amber)' : 'var(--color-muted)',
                    }}
                  >
                    {e.scoreDelta > 0 ? '+' : ''}
                    {Math.round(e.scoreDelta * 10) / 10}
                  </span>
                )}
                <span
                  className="u-num ml-auto shrink-0 text-[11px]"
                  style={{ color: 'var(--color-muted)' }}
                >
                  {timeOfDay(e.timestamp)}
                </span>
              </div>

              <p className="mt-2 text-[14.5px] leading-snug">{e.text}</p>
              <Reactions event={e} />
            </article>
          )
        })}
      </div>
    </div>
  )
}
