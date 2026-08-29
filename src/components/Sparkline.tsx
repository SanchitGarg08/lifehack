import { useId, useMemo } from 'react'
import type { Device } from '../data/types'

/**
 * The signature element.
 *
 * A step chart of the last 24 hours of plug telemetry, drawn over a hairline
 * at 0W. Wherever the trace sits at a low non-zero plateau — energy that
 * should have been zero — the gap between the trace and the axis is filled in
 * amber. A device that gets switched off has no amber anywhere. A device left
 * asleep has an amber slab across the whole night.
 *
 * Wattage is drawn on a power scale (exponent 0.42) rather than linearly. At
 * true scale a 9W standby on a 210W projector is under two pixels and the
 * whole story is invisible from the back of a room. The scale preserves zero
 * exactly, so only a device genuinely at 0W touches the line.
 */
const SCALE_EXP = 0.42
const AXIS_INSET = 1.5
const TOP_PAD = 5

interface Props {
  device: Device
  /** Demo-clock minutes, used to place the night band. */
  clock: number
  /** Minutes of standby not yet written into wattHistory. */
  liveMinutes?: number
  height?: number
  /** Plays the fall onto the axis. */
  confirming?: boolean
  showNightBand?: boolean
}

function scaleY(watts: number, max: number, h: number): number {
  const axis = h - AXIS_INSET
  if (watts <= 0) return axis
  const t = Math.pow(Math.min(1, watts / max), SCALE_EXP)
  return axis - t * (axis - TOP_PAD)
}

/** Step path: plug telemetry samples, not a smoothed curve. */
function stepPath(pts: { x: number; y: number }[], step: number): string {
  if (pts.length === 0) return ''
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`
  for (let i = 0; i < pts.length; i++) {
    const x2 = pts[i].x + step
    d += ` L ${x2.toFixed(2)} ${pts[i].y.toFixed(2)}`
    if (i + 1 < pts.length) d += ` L ${x2.toFixed(2)} ${pts[i + 1].y.toFixed(2)}`
  }
  return d
}

export default function Sparkline({
  device,
  clock,
  liveMinutes = 0,
  height = 56,
  confirming = false,
  showNightBand = true,
}: Props) {
  const uid = useId().replace(/:/g, '')
  const W = 320
  const H = height
  const axisY = H - AXIS_INSET

  const view = useMemo(() => {
    const hist = device.wattHistory
    const n = hist.length
    // While a device is asleep the 24h window slides: the live plateau eats
    // into the right edge and the history shifts left.
    const liveFrac =
      device.state === 'asleep' ? Math.min(0.42, liveMinutes / (6 * 60)) : 0
    const histW = W * (1 - liveFrac)
    const step = histW / n
    const max = Math.max(device.activeWatts, 1)
    const standbyCeiling = device.standbyWatts * 1.6

    const pts = hist.map((w, i) => ({
      x: i * step,
      y: scaleY(w, max, H),
      w,
    }))

    // Contiguous runs of low, non-zero draw: the wasted energy.
    const wedges: { d: string; top: string }[] = []
    let runStart = -1
    for (let i = 0; i <= n; i++) {
      const isIdle = i < n && hist[i] > 0 && hist[i] <= standbyCeiling
      if (isIdle && runStart === -1) runStart = i
      if (!isIdle && runStart !== -1) {
        const x1 = runStart * step
        const x2 = i * step
        const y = scaleY(hist[runStart], max, H)
        wedges.push({
          d: `M ${x1.toFixed(2)} ${axisY} L ${x1.toFixed(2)} ${y.toFixed(2)} L ${x2.toFixed(2)} ${y.toFixed(2)} L ${x2.toFixed(2)} ${axisY} Z`,
          top: `M ${x1.toFixed(2)} ${y.toFixed(2)} L ${x2.toFixed(2)} ${y.toFixed(2)}`,
        })
        runStart = -1
      }
    }

    // Night band: samples whose time of day falls between 20:00 and 08:00.
    let nightX1 = 0
    let nightX2 = 0
    if (showNightBand) {
      const minuteOf = (i: number) => clock - (n - 1 - i) * 30
      for (let i = 0; i < n; i++) {
        const tod = ((minuteOf(i) % 1440) + 1440) % 1440
        const isNight = tod >= 20 * 60 || tod < 8 * 60
        if (isNight && nightX1 === 0 && nightX2 === 0) nightX1 = i * step
        if (isNight) nightX2 = (i + 1) * step
      }
    }

    const liveY = scaleY(device.standbyWatts, max, H)

    return {
      d: stepPath(pts, step),
      wedges,
      liveFrac,
      histW,
      liveY,
      nightX1,
      nightX2,
      endY: pts[n - 1]?.y ?? axisY,
    }
  }, [device, clock, liveMinutes, H, axisY, showNightBand])

  // The only coloured trace is a sleeping one. Everything else is ink.
  const traceColor =
    device.state === 'asleep' ? 'var(--color-amber)' : 'var(--color-ink)'

  const fallDistance = axisY - view.liveY

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      preserveAspectRatio="none"
      role="img"
      aria-label={
        device.state === 'asleep'
          ? `${device.name} idling at ${device.currentWatts} watts, above the zero line`
          : device.state === 'off'
            ? `${device.name} at zero watts, resting on the line`
            : `${device.name} in use at ${device.currentWatts} watts`
      }
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <clipPath id={`clip-${uid}`}>
          <rect x="0" y="0" width={W} height={H} />
        </clipPath>
        <linearGradient id={`pulse-${uid}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="var(--color-ink)" stopOpacity="0" />
          <stop offset="50%" stopColor="var(--color-ink)" stopOpacity="1" />
          <stop offset="100%" stopColor="var(--color-ink)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* the hours nobody was in the room */}
      {view.nightX2 > view.nightX1 && (
        <rect
          x={view.nightX1}
          y="0"
          width={view.nightX2 - view.nightX1}
          height={H}
          fill="var(--color-faint)"
          opacity="0.6"
        />
      )}

      <g clipPath={`url(#clip-${uid})`}>
        {/* everything that should have been zero, drawn as the gap it is */}
        <g className={confirming ? 'anim-collapse' : undefined}>
          {view.wedges.map((w, i) => (
            <path key={i} d={w.d} fill="var(--color-amber-soft)" opacity="1" />
          ))}
          {view.wedges.map((w, i) => (
            <path
              key={`e-${i}`}
              d={w.top}
              fill="none"
              stroke="var(--color-amber)"
              strokeWidth="1.5"
              opacity="0.95"
            />
          ))}
        </g>

        <g
          className={confirming ? 'anim-fall' : undefined}
          style={confirming ? ({ '--fall': `${fallDistance}px` } as React.CSSProperties) : undefined}
        >
          <path
            d={view.d}
            fill="none"
            stroke={traceColor}
            strokeWidth="1.6"
            strokeLinejoin="miter"
            opacity={device.state === 'off' ? 0.35 : 0.85}
            transform={`scale(${view.histW / W} 1)`}
            vectorEffect="non-scaling-stroke"
          />
        </g>

        {/* the live plateau, growing across the night */}
        {view.liveFrac > 0 && !confirming && (
          <g>
            <rect
              x={view.histW}
              y={view.liveY}
              width={W - view.histW}
              height={axisY - view.liveY}
              fill="var(--color-amber-soft)"
              opacity="1"
            />
            <line
              x1={view.histW}
              y1={view.liveY}
              x2={W}
              y2={view.liveY}
              stroke="var(--color-amber)"
              strokeWidth="1.75"
              className="anim-breathe"
            />
          </g>
        )}
      </g>

      {/* 0W. The only good state. */}
      <line
        x1="0"
        y1={axisY}
        x2={W}
        y2={axisY}
        stroke="var(--color-line)"
        strokeWidth="1"
      />

      {confirming && (
        <g>
          <line
            x1="0"
            y1={axisY}
            x2={W}
            y2={axisY}
            stroke="var(--color-ink)"
            strokeWidth="1.75"
            className="anim-land"
          />
          <rect
            x="0"
            y={axisY - 2}
            width={W}
            height="4"
            fill={`url(#pulse-${uid})`}
            className="anim-pulse"
          />
        </g>
      )}

      {/* where the reading sits right now */}
      <circle
        cx={W - 2}
        cy={confirming ? axisY : device.state === 'asleep' ? view.liveY : view.endY}
        r="2.75"
        fill={confirming ? 'var(--color-ink)' : traceColor}
      />
    </svg>
  )
}
