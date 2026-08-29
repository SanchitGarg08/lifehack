import { useRef } from 'react'
import { dayLabel, timeOfDay } from '../demo/clock'
import { useDemo } from '../demo/store'

/** Triple-tap the wordmark to open the operator panel without a keyboard. */
export default function TopBar() {
  const { state, dispatch } = useDemo()
  const taps = useRef<number[]>([])

  const onLogoTap = () => {
    const now = performance.now()
    taps.current = [...taps.current, now].filter((t) => now - t < 900)
    if (taps.current.length >= 3) {
      taps.current = []
      dispatch({ type: 'toggle-panel' })
    }
  }

  return (
    <header className="flex shrink-0 items-center justify-between px-5 pt-4 pb-3">
      <button
        type="button"
        onClick={onLogoTap}
        aria-label="WATTCH"
        className="u-serif text-[19px] leading-none tracking-[0.02em]"
      >
        Wattch
      </button>
      <span className="u-num text-[12px]" style={{ color: 'var(--color-muted)' }}>
        {dayLabel(state.clock)} {timeOfDay(state.clock)}
        {state.running && (
          <span className="anim-breathe ml-1.5" style={{ color: 'var(--color-amber)' }}>
            60×
          </span>
        )}
      </span>
    </header>
  )
}
