import { useDemo } from '../demo/store'

/**
 * Operator panel. Hidden by default, opened with D or a triple-tap on the
 * wordmark, closed with D or Escape. Deliberately a small strip: it must
 * never eat the screen, and it must never end up in a screenshot.
 * Every button is instant and idempotent, so the presenter can talk over it
 * and press things out of order without breaking anything.
 */
const BUTTONS: { label: string; run: string; tone?: 'live' | 'standby' | 'reset' }[] = [
  { label: 'Projector → idle', run: 'proj-sleep', tone: 'standby' },
  { label: 'Projector → off', run: 'proj-off', tone: 'live' },
  { label: 'Printer → idle', run: 'print-sleep', tone: 'standby' },
  { label: 'Advance to morning', run: 'morning' },
  { label: 'Rival adopts', run: 'steal' },
  { label: 'Advance 1 day', run: 'day' },
  { label: 'Reset demo', run: 'reset', tone: 'reset' },
]

const TONES: Record<string, { fg: string; border: string; bg: string }> = {
  live: { fg: '#DDE3EC', border: '#39424F', bg: '#242C36' },
  standby: { fg: '#F0B173', border: '#4A3520', bg: '#2E2114' },
  reset: { fg: '#AEB6C2', border: '#39424F', bg: '#1C222A' },
}

export default function DemoPanel() {
  const { state, dispatch } = useDemo()
  if (!state.panelOpen) return null

  const run = (id: string) => {
    switch (id) {
      case 'proj-sleep':
        return dispatch({ type: 'sleep', deviceId: 'lt19-projector' })
      case 'proj-off':
        return dispatch({ type: 'power-off', deviceId: 'lt19-projector' })
      case 'print-sleep':
        return dispatch({ type: 'sleep', deviceId: 'com1-printer' })
      case 'morning':
        return dispatch({ type: 'advance-to-morning' })
      case 'steal':
        return dispatch({ type: 'rival-adopts' })
      case 'day':
        return dispatch({ type: 'advance-day' })
      case 'reset':
        return dispatch({ type: 'reset' })
    }
  }

  return (
    <div
      role="dialog"
      aria-label="Demo operator panel"
      className="op-panel anim-rise rounded-[14px] px-3 py-3"
      style={{
        background: '#171B21',
        boxShadow: '0 18px 40px -22px rgba(20,22,26,0.7)',
      }}
    >
      <p className="u-eyebrow mb-2 text-[9px]" style={{ color: '#79828F' }}>
        Operator
      </p>
      <div className="op-list flex flex-col gap-1.5">
        {BUTTONS.map((b) => {
          const tone = b.tone ? TONES[b.tone] : null
          return (
            <button
              key={b.run}
              type="button"
              onClick={() => run(b.run)}
              className="u-num w-full rounded-[8px] border px-3 py-2 text-left text-[11.5px] leading-none transition-opacity active:opacity-60"
              style={{
                borderColor: tone?.border ?? '#39424F',
                color: tone?.fg ?? '#AEB6C2',
                background: tone?.bg ?? '#1C222A',
              }}
            >
              {b.label}
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => dispatch({ type: 'toggle-panel', open: false })}
          className="u-eyebrow mt-1 text-[9px]"
          style={{ color: '#79828F' }}
        >
          Hide · D
        </button>
      </div>
    </div>
  )
}
