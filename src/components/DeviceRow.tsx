import type { Device } from '../data/types'
import { duration } from '../demo/clock'
import { formatScore } from '../demo/scoring'
import { liveScore, liveTailMinutes, minutesAsleep, useDemo } from '../demo/store'
import Sparkline from './Sparkline'

/**
 * One line per device. Name, state, score, and the shape of the last 24h.
 * Everything else lives behind a tap.
 */
export default function DeviceRow({ device }: { device: Device }) {
  const { state, dispatch } = useDemo()
  const score = liveScore(state, device)
  const asleep = device.state === 'asleep'

  return (
    <button
      type="button"
      onClick={() => dispatch({ type: 'open-device', deviceId: device.id })}
      className="flex w-full items-center gap-3 py-3 text-left"
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] leading-tight">{device.name}</span>
        <span
          className="mt-0.5 block truncate text-[12.5px]"
          style={{ color: asleep ? 'var(--color-amber)' : 'var(--color-muted)' }}
        >
          {asleep
            ? `Idle ${duration(minutesAsleep(state, device))} · ${device.currentWatts}W`
            : device.state === 'in-use'
              ? `In use · ${device.currentWatts}W`
              : `Off · ${device.cleanNights} clean nights`}
        </span>
      </span>

      <span className="w-[88px] shrink-0">
        <Sparkline
          device={device}
          clock={state.clock}
          liveMinutes={liveTailMinutes(state, device)}
          height={26}
          showNightBand={false}
        />
      </span>

      <span
        className="u-serif u-num w-[46px] shrink-0 text-right text-[21px] leading-none"
        style={{ color: asleep ? 'var(--color-amber)' : 'var(--color-ink)' }}
      >
        {formatScore(score)}
      </span>
    </button>
  )
}
