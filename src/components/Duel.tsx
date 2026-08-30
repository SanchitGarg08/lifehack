import type { Row } from '../demo/leaderboard'
import { formatScore } from '../demo/scoring'

/** You against the one person you actually care about beating. */
export default function Duel({
  you,
  rival,
  rivalInitials,
}: {
  you: number
  rival: Row
  rivalInitials: string
}) {
  const gap = Math.round((rival.score - you) * 10) / 10
  const ahead = gap <= 0
  // Where the rope sits: your share of the two scores, kept off the ends.
  const pull = Math.max(18, Math.min(82, (you / (you + rival.score)) * 100))

  return (
    <section
      className="rounded-[16px] px-4 py-4"
      style={{
        background: 'linear-gradient(150deg, #FFFFFF 0%, #F7F9FB 100%)',
        boxShadow: 'inset 0 0 0 1px var(--color-line)',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="u-eyebrow">Head to head</span>
        <span
          className="u-num rounded-full px-2.5 py-[3px] text-[11px]"
          style={{
            background: ahead ? 'linear-gradient(120deg, #E4F1EA, #D9EBE1)' : 'var(--color-amber-soft)',
            color: ahead ? '#2F6B52' : 'var(--color-amber)',
          }}
        >
          {ahead ? `${formatScore(-gap)} ahead` : `${formatScore(gap)} behind`}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px]"
          style={{ background: 'var(--color-ink)', color: '#FFFFFF' }}
        >
          SG
        </span>
        <span className="u-serif u-num text-[22px] leading-none">{formatScore(you)}</span>

        <span className="min-w-0 flex-1 px-1">
          <span
            className="relative block h-[8px] w-full overflow-hidden rounded-full"
            style={{ background: '#EDF0F4' }}
          >
            <span
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${pull}%`,
                background: 'linear-gradient(90deg, #2F6B52 0%, #5C9E7D 100%)',
                transition: 'width 900ms cubic-bezier(0.22,0.9,0.24,1)',
              }}
            />
            <span
              className="absolute top-1/2 block rounded-full"
              style={{
                left: `${pull}%`,
                width: 3,
                height: 16,
                marginLeft: -1.5,
                marginTop: -8,
                background: 'var(--color-ink)',
                transition: 'left 900ms cubic-bezier(0.22,0.9,0.24,1)',
              }}
            />
          </span>
        </span>

        <span className="u-serif u-num text-[22px] leading-none" style={{ color: 'var(--color-muted)' }}>
          {formatScore(rival.score)}
        </span>
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px]"
          style={{ background: '#E8DCF2', color: '#5B4A7D' }}
        >
          {rivalInitials}
        </span>
      </div>

      <p className="mt-2.5 text-[13px]" style={{ color: 'var(--color-muted)' }}>
        {ahead
          ? `You are ahead of ${rival.name.split(' ')[0]}. One bad night hands it back.`
          : `Beat ${rival.name.split(' ')[0]} and you take second in the Gremlins.`}
      </p>
    </section>
  )
}
