import { useFrame } from '@react-three/fiber'
import { useState } from 'react'
import { GEO, reservoirBottomY } from '../sim/geometry'
import { useSimStore } from '../state/useSimStore'
import { useCutawayPlanes } from './clipping'
import { FilterLayers } from './Layers'
import { FlowVectors } from './FlowVectors'
import { GlassVessel } from './GlassVessel'
import { LabStand } from './LabStand'
import { Manometer } from './Manometer'
import { ParticleField } from './ParticleField'
import { Plumbing } from './Plumbing'
import { Probe } from './Probe'
import { WaterVolumes } from './WaterVolumes'

export function BiofilterAssembly() {
  const [e, setE] = useState(0)
  const cutaway = useSimStore((s) => s.cutaway)
  const showLayers = useSimStore((s) => s.showLayers)
  const valveOpening = useSimStore((s) => s.valveOpening)
  const porosity = useSimStore((s) => s.porosity)
  const dp = useSimStore((s) => s.particleDiameter)
  const planes = useCutawayPlanes(cutaway)

  useFrame((_, dt) => {
    const target = useSimStore.getState().exploded ? 1 : 0
    setE((prev) => {
      const next = prev + (target - prev) * Math.min(1, dt * 4)
      if (Math.abs(next - target) < 0.003) return target
      return next
    })
  })

  return (
    <group>
      <GlassVessel
        innerR={GEO.column.innerR}
        outerR={GEO.column.outerR}
        height={GEO.column.height}
        yBottom={GEO.column.bottomY}
        kind="pet"
        capOffsetTop={e * 0.09}
        capOffsetBottom={e * -0.06}
        clippingPlanes={planes}
        clipped={cutaway}
      />
      <group position={[0, e * 0.1, 0]}>
        <GlassVessel
          innerR={GEO.reservoir.innerR}
          outerR={GEO.reservoir.outerR}
          height={GEO.reservoir.height}
          yBottom={reservoirBottomY}
          kind="glass"
          openTop
          clippingPlanes={planes}
          clipped={cutaway}
        />
      </group>
      <group position={[GEO.beaker.x, 0, GEO.beaker.z]}>
        <GlassVessel
          innerR={GEO.beaker.innerR}
          outerR={GEO.beaker.outerR}
          height={GEO.beaker.height}
          yBottom={GEO.beaker.bottomY}
          kind="glass"
          openTop
          clippingPlanes={null}
          clipped={false}
        />
      </group>

      <LabStand />
      <Manometer />
      <FilterLayers
        show={showLayers}
        cutaway={cutaway}
        explode={e}
        porosity={porosity}
        dp={dp}
        clippingPlanes={planes}
      />
      <Plumbing
        valveOpening={valveOpening}
        explode={e}
        clippingPlanes={planes}
        clipped={cutaway}
      />
      <WaterVolumes explode={e} cutaway={cutaway} clippingPlanes={planes} />
      <ParticleField explode={e} />
      <FlowVectors />
      <Probe />
    </group>
  )
}
