import { seeded } from '../demo/rng'
import { useDemo } from '../demo/store'

/**
 * The full-screen reaction to a settled score change. Up is a burst of light;
 * down is a fall. It holds for 2.6 seconds and clears itself — long enough to
 * feel like something happened, short enough that the presenter keeps talking
 * over it.
 *
 * Every particle position comes from a fixed seed, so the same moment plays
 * identically every run.
 */
const RAYS = 11
const CONFETTI = 22

const UP_COLORS = ['#C9973A', '#E0B45F', '#5C9E7D', '#A8611F', '#8C7BB5']

function Confetti() {
  const rand = seeded(4242)
  return (
    <>
      {Array.from({ length: CONFETTI }, (_, i) => {
        const angle = (i / CONFETTI) * Math.PI * 2 + rand() * 0.4
        const dist = 120 + rand() * 150
        const size = 5 + Math.round(rand() * 5)
        return (
          <span
            key={i}
            className="confetti absolute block"
            style={
              {
                left: '50%',
                top: '46%',
                width: size,
                height: size * (rand() > 0.5 ? 1 : 2.2),
                borderRadius: rand() > 0.6 ? '50%' : 2,
                background: UP_COLORS[i % UP_COLORS.length],
                animationDelay: `${Math.round(rand() * 260)}ms`,
                '--dx': `${Math.cos(angle) * dist}px`,
                '--dy': `${Math.sin(angle) * dist - 40}px`,
                '--r': `${Math.round(rand() * 540 - 270)}deg`,
              } as React.CSSProperties
            }
          />
        )
      })}
    </>
  )
}

export default function Moment() {
  const { state } = useDemo()
  const moment = state.celebration
  if (!moment) return null
  const up = moment.kind === 'up'

  return (
    <div
      className="moment pointer-events-none absolute inset-0 z-[70] overflow-hidden"
      role="status"
      aria-live="polite"
      key={moment.id}
      style={{
        background: up
          ? 'radial-gradient(120% 70% at 50% 42%, rgba(255,251,242,0.97) 0%, rgba(250,244,232,0.95) 45%, rgba(246,247,249,0.93) 100%)'
          : 'radial-gradient(120% 70% at 50% 40%, rgba(255,246,236,0.97) 0%, rgba(248,232,216,0.95) 48%, rgba(244,240,236,0.94) 100%)',
        backdropFilter: 'blur(2px)',
      }}
    >
      {up ? (
        <>
          {/* light fanning out from behind the number */}
          {Array.from({ length: RAYS }, (_, i) => (
            <span
              key={i}
              className="ray absolute block"
              style={
                {
                  left: '50%',
                  top: '-24%',
                  width: 2,
                  height: '76%',
                  marginLeft: -1,
                  background:
                    'linear-gradient(180deg, rgba(201,151,58,0) 0%, rgba(201,151,58,0.5) 100%)',
                  animationDelay: `${i * 34}ms`,
                  '--a': `${(i - (RAYS - 1) / 2) * 15}deg`,
                } as React.CSSProperties
              }
            />
          ))}
          <span
            className="ring absolute rounded-full"
            style={{
              left: '50%',
              top: '46%',
              width: 180,
              height: 180,
              marginLeft: -90,
              marginTop: -90,
              border: '2px solid rgba(201,151,58,0.55)',
            }}
          />
          <Confetti />
        </>
      ) : (
        <>
          {Array.from({ length: 9 }, (_, i) => (
            <span
              key={i}
              className="streak absolute block"
              style={{
                left: `${8 + i * 10.5}%`,
                top: 0,
                width: 1.5,
                height: '55%',
                background:
                  'linear-gradient(180deg, rgba(168,97,31,0) 0%, rgba(168,97,31,0.65) 100%)',
                animationDelay: `${i * 55}ms`,
              }}
            />
          ))}
        </>
      )}

      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
        <p
          className="moment-line u-eyebrow text-[11px]"
          style={{ color: up ? '#9A7326' : 'var(--color-amber)' }}
        >
          {moment.headline}
        </p>
        <p
          className={`u-serif u-num mt-2 leading-none ${up ? 'moment-figure' : 'moment-figure-down'}`}
          style={{
            fontSize: 72,
            letterSpacing: '-0.03em',
            color: up ? '#8A6520' : 'var(--color-amber)',
          }}
        >
          {moment.figure}
        </p>
        <p
          className="moment-line mt-3 max-w-[240px] text-[14px] leading-snug"
          style={{ color: 'var(--color-muted)', animationDelay: '120ms' }}
        >
          {moment.detail}
        </p>
      </div>
    </div>
  )
}
