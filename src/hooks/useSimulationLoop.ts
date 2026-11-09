import { useEffect, useRef } from 'react'
import { useSimStore } from '../state/useSimStore'

export function useSimulationLoop(): void {
  const raf = useRef(0)
  const last = useRef(0)

  useEffect(() => {
    last.current = performance.now()
    const tick = (now: number) => {
      const dt = (now - last.current) / 1000
      last.current = now
      useSimStore.getState().advance(dt)
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [])
}
