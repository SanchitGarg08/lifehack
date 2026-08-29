import { useEffect, useRef, useState } from 'react'

/**
 * Counts a number up on mount, then hands over to the live value.
 *
 * Driven by an interval, not requestAnimationFrame: rAF is suspended while the
 * window is unfocused, which would leave the hero score frozen at zero if the
 * app loaded in a background tab. It always lands exactly on `target`.
 */
export function useCountUp(target: number, ms = 750): number {
  const [value, setValue] = useState(target)
  const done = useRef(false)

  useEffect(() => {
    if (done.current) {
      setValue(target)
      return
    }
    const start = performance.now()
    setValue(0)
    const id = setInterval(() => {
      const t = Math.min(1, (performance.now() - start) / ms)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(target * eased)
      if (t >= 1) {
        done.current = true
        setValue(target)
        clearInterval(id)
      }
    }, 32)
    return () => clearInterval(id)
  }, [target, ms])

  return value
}
