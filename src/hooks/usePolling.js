import { useEffect, useRef } from 'react'

export function usePolling(fn, interval = 3000, enabled = true) {
  const fnRef = useRef(fn)
  fnRef.current = fn

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    const run = () => { if (!cancelled) fnRef.current() }
    run()
    const id = setInterval(run, interval)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [interval, enabled])
}
