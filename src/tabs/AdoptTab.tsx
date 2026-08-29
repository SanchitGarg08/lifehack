import { BUILDING_ORDER } from '../data/devices'
import type { Device } from '../data/types'
import { useDemo } from '../demo/store'

function NeglectMeter({ rating }: { rating: number }) {
  return (
    <span className="flex shrink-0 items-center gap-[2px]" aria-label={`Neglect ${rating} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{
            width: 8,
            height: 3,
            borderRadius: 1,
            background: i <= rating ? 'var(--color-amber)' : 'var(--color-line)',
          }}
        />
      ))}
    </span>
  )
}

function Row({ device }: { device: Device }) {
  const { dispatch } = useDemo()
  return (
    <button
      type="button"
      onClick={() => dispatch({ type: 'open-device', deviceId: device.id })}
      className="flex w-full items-center gap-3 py-3 text-left"
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] leading-tight">{device.name}</span>
        <span
          className="u-num mt-1 block text-[12.5px]"
          style={{ color: 'var(--color-muted)' }}
        >
          Idle {device.nightsLeftAsleep} of {device.nightsTracked} nights
        </span>
      </span>
      <NeglectMeter rating={device.neglectRating} />
      <span
        className="shrink-0 rounded-full px-3.5 py-1.5 text-[13px]"
        style={{ background: 'var(--color-ink)', color: 'var(--color-card)' }}
        onClick={(e) => {
          e.stopPropagation()
          dispatch({ type: 'adopt', deviceId: device.id })
        }}
      >
        Adopt
      </span>
    </button>
  )
}

export default function AdoptTab() {
  const { state } = useDemo()
  const free = state.devices.filter((d) => d.ownerId === null)
  const worst = (a: Device, b: Device) =>
    b.neglectRating - a.neglectRating || a.stewardshipScore - b.stewardshipScore

  const groups = BUILDING_ORDER.map((building) => ({
    building,
    devices: free.filter((d) => d.building === building).sort(worst),
  })).filter((g) => g.devices.length > 0)

  const top = [...free].sort(worst).slice(0, 3)

  return (
    <div className="px-5 pb-8">
      <h2 className="u-serif text-[26px] leading-none">Adopt</h2>
      <p className="mt-1.5 text-[13px]" style={{ color: 'var(--color-muted)' }}>
        {free.length} devices nobody is watching.
      </p>

      <div className="mt-5">
        <p className="u-eyebrow" style={{ color: 'var(--color-amber)' }}>
          Worst on campus
        </p>
        <div className="mt-1">
          {top.map((d, i) => (
            <div
              key={d.id}
              style={i > 0 ? { borderTop: '1px solid var(--color-line)' } : undefined}
            >
              <Row device={d} />
            </div>
          ))}
        </div>
      </div>

      {groups.map((g) => (
        <div key={g.building} className="mt-6">
          <p className="u-eyebrow">{g.building}</p>
          <div className="mt-1">
            {g.devices.map((d, i) => (
              <div
                key={d.id}
                style={i > 0 ? { borderTop: '1px solid var(--color-line)' } : undefined}
              >
                <Row device={d} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
