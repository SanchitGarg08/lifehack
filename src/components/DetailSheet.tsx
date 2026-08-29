import { TYPE_LABEL } from '../data/devices'
import { duration, minutesUntilMorning } from '../demo/clock'
import {
  GRACE_MINUTES,
  drainPoints,
  formatScore,
  wattHours,
} from '../demo/scoring'
import {
  graceRemaining,
  liveScore,
  liveTailMinutes,
  minutesAsleep,
  useDemo,
} from '../demo/store'
import { CURRENT_USER_ID } from '../data/users'
import Sparkline from './Sparkline'

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="u-eyebrow text-[10px]">{label}</span>
      <span
        className="u-serif u-num text-[24px] leading-none"
        style={{ color: accent ? 'var(--color-amber)' : 'var(--color-ink)' }}
      >
        {value}
      </span>
    </div>
  )
}

/** Everything the row leaves out. Opened by tapping a device. */
export default function DetailSheet() {
  const { state, dispatch } = useDemo()
  const device = state.devices.find((d) => d.id === state.openDeviceId)
  if (!device) return null

  const close = () => dispatch({ type: 'open-device', deviceId: null })
  const score = liveScore(state, device)
  const asleepFor = minutesAsleep(state, device)
  const grace = graceRemaining(state, device)
  const mine = device.ownerId === CURRENT_USER_ID
  const confirming = state.confirmation?.deviceId === device.id && state.confirmation.playing
  const settlement = state.settlement?.deviceId === device.id ? state.settlement : null

  const sleepStart = device.asleepSince ?? state.clock
  const toMorning = minutesUntilMorning(sleepStart) / 60
  const projPoints = Math.round(drainPoints(device.standbyWatts, toMorning))
  const projWh = Math.round(wattHours(device.standbyWatts, toMorning))
  const nightly = Math.round(drainPoints(device.standbyWatts, 14))

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="anim-veil absolute inset-0"
        style={{ background: 'rgba(20,22,26,0.28)' }}
      />

      <div
        className="anim-sheet scroll-y relative rounded-t-[20px] px-5 pt-4 pb-6"
        style={{
          background: 'var(--color-card)',
          maxHeight: '82%',
          boxShadow: '0 -18px 48px -24px rgba(20,22,26,0.35)',
        }}
      >
        <div
          className="mx-auto mb-4 h-[3px] w-9 rounded-full"
          style={{ background: 'var(--color-line)' }}
        />

        <h2 className="u-serif text-[24px] leading-tight">{device.name}</h2>
        <p className="mt-1 text-[13px]" style={{ color: 'var(--color-muted)' }}>
          {device.building} · {device.room} · {TYPE_LABEL[device.type]}
        </p>

        <div className="mt-5">
          <Sparkline
            device={device}
            clock={state.clock}
            liveMinutes={liveTailMinutes(state, device)}
            height={72}
            confirming={confirming}
          />
          <div className="mt-1.5 flex justify-between">
            <span className="u-eyebrow text-[9px]">Last 24 hours</span>
            <span className="u-eyebrow text-[9px]">Zero line</span>
          </div>
        </div>

        <div
          className="mt-5 grid grid-cols-3 gap-4 border-t pt-4"
          style={{ borderColor: 'var(--color-line)' }}
        >
          <Stat
            label="Now"
            value={`${Math.round(device.currentWatts)}W`}
            accent={device.state === 'asleep'}
          />
          <Stat label="Score" value={formatScore(score)} accent={device.state === 'asleep'} />
          <Stat label="Clean nights" value={String(device.cleanNights)} />
        </div>

        <dl
          className="mt-4 flex flex-col gap-2 border-t pt-4 text-[13px]"
          style={{ borderColor: 'var(--color-line)' }}
        >
          <div className="flex justify-between">
            <dt style={{ color: 'var(--color-muted)' }}>In use / standby</dt>
            <dd className="u-num">
              {device.activeWatts}W / {device.standbyWatts}W
            </dd>
          </div>
          <div className="flex justify-between">
            <dt style={{ color: 'var(--color-muted)' }}>Left idle</dt>
            <dd className="u-num">
              {device.nightsLeftAsleep} of {device.nightsTracked} nights
            </dd>
          </div>
          <div className="flex justify-between">
            <dt style={{ color: 'var(--color-muted)' }}>A night on standby</dt>
            <dd className="u-num">−{nightly} pts</dd>
          </div>
        </dl>

        {/* --- the settlement, if this is the morning after ---------------- */}
        {settlement && (
          <div
            className="mt-4 rounded-[12px] px-4 py-3.5"
            style={{ background: 'var(--color-amber-soft)' }}
          >
            <p className="u-serif text-[17px]" style={{ color: 'var(--color-amber)' }}>
              Still idle at 08:00
            </p>
            <dl className="mt-2.5 flex flex-col gap-1.5 text-[13px]">
              <div className="flex justify-between">
                <dt style={{ color: 'var(--color-muted)' }}>
                  {settlement.hours}h standby · {settlement.wattHours} Wh
                </dt>
                <dd className="u-num">−{settlement.drain}</dd>
              </div>
              <div className="flex justify-between">
                <dt style={{ color: 'var(--color-muted)' }}>At-risk penalty</dt>
                <dd className="u-num">−{settlement.penalty}</dd>
              </div>
              <div
                className="mt-1 flex justify-between border-t pt-1.5"
                style={{ borderColor: 'rgba(168,97,31,0.22)' }}
              >
                <dt className="u-num">
                  {formatScore(settlement.before)} → {formatScore(settlement.after)}
                </dt>
                <dd className="u-num" style={{ color: 'var(--color-amber)' }}>
                  −{settlement.drain + settlement.penalty}
                </dd>
              </div>
            </dl>
            <p className="mt-2.5 text-[13px]" style={{ color: 'var(--color-muted)' }}>
              Anyone can adopt it now.
            </p>
          </div>
        )}

        {/* --- the confirmation -------------------------------------------- */}
        {state.confirmation?.deviceId === device.id && device.state === 'off' && (
          <div
            className="mt-4 rounded-[12px] px-4 py-3.5"
            style={{ background: 'var(--color-faint)' }}
          >
            <p className="u-serif text-[17px]">Powered off</p>
            <p className="mt-1 text-[13px]" style={{ color: 'var(--color-muted)' }}>
              Confirmed at 0W by plug telemetry. Caught in time, so nothing was lost.
            </p>
          </div>
        )}

        {/* --- the one action ---------------------------------------------- */}
        {mine && device.state === 'asleep' && !device.atRisk && (
          <div className="mt-5">
            <p className="text-[14px] leading-snug">
              Your {TYPE_LABEL[device.type].toLowerCase()} is idling, not off.
            </p>
            {grace === null ? (
              <>
                <p className="u-num mt-1.5 text-[13px]" style={{ color: 'var(--color-amber)' }}>
                  −{projPoints} points · {projWh} Wh if it idles until 8am
                </p>
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'on-it', deviceId: device.id })}
                  className="mt-3.5 w-full rounded-[11px] py-3 text-[15px] transition-transform active:scale-[0.99]"
                  style={{ background: 'var(--color-ink)', color: 'var(--color-card)' }}
                >
                  I'm on it
                </button>
              </>
            ) : (
              <div className="mt-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-[13px]" style={{ color: 'var(--color-muted)' }}>
                    Walking there
                  </span>
                  <span
                    className="u-serif u-num text-[22px] leading-none"
                    style={{ color: 'var(--color-amber)' }}
                  >
                    {String(Math.floor(grace / 60)).padStart(2, '0')}:
                    {String(Math.floor(grace % 60)).padStart(2, '0')}
                  </span>
                </div>
                <div
                  className="mt-2 h-[3px] w-full overflow-hidden rounded-full"
                  style={{ background: 'var(--color-line)' }}
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
                <p className="mt-2 text-[12px]" style={{ color: 'var(--color-muted)' }}>
                  {GRACE_MINUTES}-minute window, compressed 60× for the demo. Still
                  drawing {device.currentWatts}W until the plug reads zero.
                </p>
              </div>
            )}
          </div>
        )}

        {!mine && device.ownerId === null && (
          <button
            type="button"
            onClick={() => {
              dispatch({ type: 'adopt', deviceId: device.id })
              close()
            }}
            className="mt-5 w-full rounded-[11px] py-3 text-[15px] transition-transform active:scale-[0.99]"
            style={{ background: 'var(--color-ink)', color: 'var(--color-card)' }}
          >
            Adopt
          </button>
        )}

        {asleepFor > 0 && device.state === 'asleep' && !mine && (
          <p className="mt-3 text-[13px]" style={{ color: 'var(--color-muted)' }}>
            Idle {duration(asleepFor)} and counting.
          </p>
        )}
      </div>
    </div>
  )
}
