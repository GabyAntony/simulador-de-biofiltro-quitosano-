import { useMemo } from 'react'
import { Plane, Vector3 } from 'three'

/** Oculta la mitad +Z (frente) para vista de corte. */
export function useCutawayPlanes(enabled: boolean): Plane[] | null {
  const planes = useMemo(() => [new Plane(new Vector3(0, 0, -1), 0)], [])
  return enabled ? planes : null
}
