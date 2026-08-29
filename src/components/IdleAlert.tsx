import type { Device } from '../data/types'
import { duration, minutesUntilMorning } from '../demo/clock'
import { GRACE_MINUTES, drainPoints, formatScore, wattHours } from '../demo/scoring'
import { graceRemaining, liveScore, minutesAsleep, useDemo } from '../demo/store'

/**
 * The one thing on the home screen that is allowed to shout. Amber field,
 * breathing halo, and the score visibly falling — you should not be able to
 * look at this screen and not deal with it.
 */
export default function IdleAlert({ device }: { device: Device }) {
  const { state, dispatch } = useDemo()
  const rt = state.runtime[device.id]
  const score = liveScore(state, device)
  const lost = rt ? Math.max(0, rt.scoreAtSleep - score) : 0
  const grace = graceRemaining(state, device)
  const toMorning = minutesUntilMorning(device.asleepSince ?? state.clock) / 60
  const cost = Math.round(drainPoints(device.standbyWatts, toMorning))
  const wh = Math.round(wattHours(device.standbyWatts, toMorning))

  return (
    <section
      className="anim-rise anim-halo mt-4 overflow-hidden rounded-[16px]"
      style={{
        background: 'var(--color-amber-soft)',
        border: '1px solid rgba(168,97,31,0.28)',
      }}
    >
      <div className="px-4 pt-3.5 pb-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span
              className="anim-breathe block h-[7px] w-[7px] rounded-full"
              style={{ background: 'var(--color-amber)' }}
            />
            <span className="u-eyebrow text-[10px]" style={{ color: 'var(--color-amber)' }}>
              Idle {duration(minutesAsleep(state, device))}
            </span>
          </span>
          <span className="u-num text-[12px]" style={{ color: 'var(--color-amber)' }}>
            {device.currentWatts}W
          </span>
        </div>

        <h2 className="u-serif mt-2.5 text-[22px] leading-[1.15]">
          {device.name} is idling.
        </h2>
        <p className="mt-1 text-[13.5px]" style={{ color: 'var(--color-muted)' }}>
          Somebody put it to sleep instead of switching it off.
        </p>

        {/* the score falling, in the open */}
        <div
          className="mt-3.5 flex items-end justify-between rounded-[11px] px-3.5 py-3"
          style={{ background: 'rgba(255,255,255,0.72)' }}
        >
          <div>
            <p className="u-eyebrow text-[9px]">Score now</p>
            <p
              className="u-serif u-num mt-1 text-[30px] leading-none"
              style={{ color: 'var(--color-amber)' }}
            >
              {formatScore(score)}
            </p>
          </div>
          <div className="text-right">
            <p className="u-eyebrow text-[9px]">Falling</p>
            <p
              className="u-num anim-tick mt-1 text-[15px] leading-none"
              key={formatScore(lost)}
              style={{ color: 'var(--color-amber)' }}
            >
              −{formatScore(lost)}
            </p>
          </div>
        </div>

        <p className="u-num mt-2.5 text-[12.5px]" style={{ color: 'var(--color-amber)' }}>
          −{cost} points · {wh} Wh if nobody touches it before 8am
        </p>

        {grace === null ? (
          <button
            type="button"
            onClick={() => dispatch({ type: 'on-it', deviceId: device.id })}
            className="mt-3.5 w-full rounded-[12px] py-3 text-[15px] transition-transform active:scale-[0.99]"
            style={{ background: 'var(--color-amber)', color: '#FFF8F0' }}
          >
            I'm on it
          </button>
        ) : (
          <div className="mt-3.5">
            <div className="flex items-baseline justify-between">
              <span className="u-eyebrow text-[10px]">Walking there</span>
              <span
                className="u-serif u-num text-[24px] leading-none"
                style={{ color: 'var(--color-amber)' }}
              >
                {String(Math.floor(grace / 60)).padStart(2, '0')}:
                {String(Math.floor(grace % 60)).padStart(2, '0')}
              </span>
            </div>
            <div
              className="mt-2 h-[4px] w-full overflow-hidden rounded-full"
              style={{ background: 'rgba(168,97,31,0.18)' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(grace / GRACE_MINUTES) * 100}%`,
                  background: 'var(--color-amber)',
                  transition: 'width 240ms linear',
                }}
              />
            </div>
            <p className="mt-2 text-[11.5px]" style={{ color: 'var(--color-muted)' }}>
              {GRACE_MINUTES}-minute window, compressed 60× for the demo. It keeps
              drawing {device.currentWatts}W until the plug reads zero.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
