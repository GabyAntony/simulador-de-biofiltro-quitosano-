import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import {
  BufferAttribute,
  Color,
  CylinderGeometry,
  type Mesh,
  type MeshPhysicalMaterial,
  type Plane,
} from 'three'
import { localConcentration } from '../sim/adsorption'
import { concentrationToRgb } from '../sim/color'
import {
  beakerArea,
  GEO,
  layerBounds,
  reservoirArea,
  reservoirBottomY,
} from '../sim/geometry'
import { engineRef, useSimStore } from '../state/useSimStore'
import { clipProps } from './materials'

type Props = {
  explode: number
  cutaway: boolean
  clippingPlanes: Plane[] | null
}

export function WaterVolumes({ explode, cutaway, clippingPlanes }: Props) {
  const resRef = useRef<Mesh>(null)
  const colRef = useRef<Mesh>(null)
  const beakRef = useRef<Mesh>(null)
  const resMat = useRef<MeshPhysicalMaterial>(null)
  const beakMat = useRef<MeshPhysicalMaterial>(null)
  const clip = clipProps(clippingPlanes, cutaway)

  const columnWaterGeo = useMemo(() => {
    const geometry = new CylinderGeometry(
      GEO.column.innerR * 0.93,
      GEO.column.innerR * 0.93,
      1,
      40,
      32,
      true,
    )
    const colors = new Float32Array(geometry.attributes.position.count * 3)
    geometry.setAttribute('color', new BufferAttribute(colors, 3))
    return geometry
  }, [])

  useFrame(() => {
    const { C0, continuousFeed } = useSimStore.getState()
    const engine = engineRef.current
    const hRes = engine.reservoirVolume / reservoirArea
    // En continuo el vaso representa un colector con desagüe: se muestra un
    // nivel estable. Sin continuo, el nivel sigue el volumen acumulado.
    const hBeak = continuousFeed
      ? GEO.beaker.height * 0.45
      : Math.min(
          GEO.beaker.height * 0.9,
          engine.collectorVolume / beakerArea,
        )
    const inletRgb = concentrationToRgb(C0, C0)
    const outletRgb = concentrationToRgb(engine.C, C0)

    if (resRef.current) {
      const h = Math.max(0.001, hRes)
      resRef.current.scale.y = h
      resRef.current.position.y = reservoirBottomY + explode * 0.1 + h / 2
      resRef.current.visible = hRes > 0.001
    }

    if (colRef.current) {
      const flowing = engine.Q > 1e-10 || engine.collectorVolume > 1e-8
      colRef.current.visible = flowing
      const h = GEO.column.height - GEO.column.capH * 1.5
      colRef.current.scale.y = h
      colRef.current.position.y = GEO.column.bottomY + GEO.column.capH + h / 2

      const position = columnWaterGeo.attributes.position
      const colorAttribute = columnWaterGeo.attributes.color as BufferAttribute
      const colors = colorAttribute.array as Float32Array
      const chi0 = layerBounds.chitosan.y0
      const chi1 = layerBounds.chitosan.y1

      /* oxlint-disable react/immutability -- los buffers de vértices de Three.js se actualizan por frame */
      for (let i = 0; i < position.count; i += 1) {
        const worldY =
          colRef.current.position.y + position.getY(i) * colRef.current.scale.y
        const C = localConcentration(worldY, chi0, chi1, C0, engine.C)
        const rgb = concentrationToRgb(C, C0)
        colors[i * 3] = rgb[0]
        colors[i * 3 + 1] = rgb[1]
        colors[i * 3 + 2] = rgb[2]
      }
      colorAttribute.needsUpdate = true
      /* oxlint-enable react/immutability */
    }

    if (beakRef.current) {
      const h = Math.max(0.001, hBeak)
      beakRef.current.scale.y = h
      beakRef.current.position.y = GEO.beaker.bottomY + h / 2
      beakRef.current.visible = continuousFeed
        ? engine.Veff > 1e-8
        : engine.collectorVolume > 1e-8 && hBeak > 0.002
    }

    resMat.current?.color.copy(new Color(...inletRgb))
    beakMat.current?.color.copy(new Color(...outletRgb))
  })

  return (
    <group>
      <mesh ref={resRef}>
        <cylinderGeometry
          args={[
            GEO.reservoir.innerR * 0.97,
            GEO.reservoir.innerR * 0.97,
            1,
            40,
          ]}
        />
        <meshPhysicalMaterial
          ref={resMat}
          transparent
          opacity={0.62}
          roughness={0.12}
          metalness={0}
          depthWrite={false}
          {...clip}
        />
      </mesh>

      <mesh ref={colRef} geometry={columnWaterGeo}>
        <meshPhysicalMaterial
          vertexColors
          transparent
          opacity={0.3}
          roughness={0.15}
          metalness={0}
          depthWrite={false}
          {...clip}
        />
      </mesh>

      <mesh ref={beakRef} position={[GEO.beaker.x, 0, GEO.beaker.z]}>
        <cylinderGeometry
          args={[
            GEO.beaker.innerR * 0.96,
            GEO.beaker.innerR * 0.96,
            1,
            40,
          ]}
        />
        <meshPhysicalMaterial
          ref={beakMat}
          transparent
          opacity={0.58}
          roughness={0.1}
          metalness={0}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
