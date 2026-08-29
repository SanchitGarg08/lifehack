import { useId } from 'react'

/**
 * The Watch Score as a bulb that fills.
 *
 * A bar told you a percentage. This tells you the same thing but reads as an
 * object — full and warm at 100, cold and clear when you have been letting
 * things idle. The glass, the filament and the glow all respond, so the state
 * is legible from across a room.
 */
const GLASS =
  'M 32 12 C 44.5 12 55 22 55 35.5 C 55 46 47.5 52.5 43 58.5 L 43 64 L 21 64 L 21 58.5 C 16.5 52.5 9 46 9 35.5 C 9 22 19.5 12 32 12 Z'

export default function ScoreBulb({
  score,
  size = 78,
}: {
  score: number
  size?: number
}) {
  const uid = useId().replace(/:/g, '')
  const pct = Math.max(0, Math.min(100, score)) / 100
  // The glass runs from y=12 to y=64; the fill slides down out of it.
  const travel = 52 * (1 - pct)
  const warm = pct > 0.55

  return (
    <svg
      viewBox="0 0 64 96"
      width={size * (64 / 96)}
      height={size}
      role="img"
      aria-label={`Watch Score ${Math.round(score)} out of 100`}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <clipPath id={`glass-${uid}`}>
          <path d={GLASS} />
        </clipPath>
        <linearGradient id={`fill-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F6DFB0" />
          <stop offset="55%" stopColor="#DDB064" />
          <stop offset="100%" stopColor="#C08A2E" />
        </linearGradient>
        <radialGradient id={`glow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E6BC72" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#E6BC72" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* light spilling out, only once there is something to spill */}
      <circle
        cx="32"
        cy="36"
        r="34"
        fill={`url(#glow-${uid})`}
        style={{ opacity: pct * pct, transition: 'opacity 900ms ease' }}
      />

      <g clipPath={`url(#glass-${uid})`}>
        <path d={GLASS} fill="#FFFFFF" />
        <g
          style={{
            transform: `translateY(${travel}px)`,
            transition: 'transform 1100ms cubic-bezier(0.22, 0.9, 0.24, 1)',
          }}
        >
          <rect x="0" y="12" width="64" height="54" fill={`url(#fill-${uid})`} />
          <rect x="0" y="12" width="64" height="1.4" fill="#FBEFD5" opacity="0.9" />
        </g>
      </g>

      {/* filament: cool and thin when the score is low, lit when it is high */}
      <path
        d="M 25 47 L 25 40 Q 28.5 31 32 39 Q 35.5 47 39 39 L 39 47"
        fill="none"
        stroke={warm ? '#8A5F16' : 'var(--color-muted)'}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: 'stroke 700ms ease' }}
        opacity={warm ? 0.75 : 0.5}
      />

      <path
        d={GLASS}
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="1.7"
        opacity="0.82"
      />

      {/* screw base */}
      <path
        d="M 21 64 L 43 64 L 43 70 Q 43 72 41 72 L 23 72 Q 21 72 21 70 Z"
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="1.7"
        opacity="0.82"
        strokeLinejoin="round"
      />
      <path
        d="M 22 76 L 42 76 M 23 81 L 41 81 M 26 86 L 38 86"
        stroke="var(--color-ink)"
        strokeWidth="1.7"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  )
}
