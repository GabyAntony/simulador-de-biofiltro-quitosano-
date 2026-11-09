import { useLayoutEffect, useMemo, useRef } from 'react'
import type { InstancedMesh } from 'three'
import { GEO, layerBounds } from '../sim/geometry'
import {
  CARBON_COLOR,
  CHITOSAN_COLOR,
  clipProps,
  COTTON_COLOR,
} from './materials'
import { packChitosanBed, packCylinder, writeInstances } from './packing'
import type { Plane } from 'three'

type Props = {
  show: boolean
  cutaway: boolean
  explode: number
  porosity: number
  dp: number
  clippingPlanes: Plane[] | null
}

export function FilterLayers({
  show,
  cutaway,
  explode,
  porosity,
  dp,
  clippingPlanes,
}: Props) {
  const cottonTop = useRef<InstancedMesh>(null)
  const cottonBot = useRef<InstancedMesh>(null)
  const chitosan = useRef<InstancedMesh>(null)
  const carbon = useRef<InstancedMesh>(null)
  const clip = clipProps(clippingPlanes, cutaway)

  const r = GEO.column.innerR

  const topItems = useMemo(
    () =>
      packCylinder(
        layerBounds.topCotton.y0,
        layerBounds.topCotton.y1,
        r,
        90,
        11,
        0.35,
      ),
    [r],
  )
  const botItems = useMemo(
    () =>
      packCylinder(
        layerBounds.bottomCotton.y0,
        layerBounds.bottomCotton.y1,
        r,
        110,
        29,
        0.25,
      ),
    [r],
  )
  const chiItems = useMemo(
    () =>
      packChitosanBed(
        layerBounds.chitosan.y0,
        layerBounds.chitosan.y1,
        r,
        dp,
        porosity,
      ),
    [r, dp, porosity],
  )
  const carbItems = useMemo(
    () =>
      packCylinder(
        layerBounds.carbon.y0,
        layerBounds.carbon.y1,
        r,
        160,
        83,
        0.45,
      ),
    [r],
  )

  useLayoutEffect(() => {
    writeInstances(cottonTop.current, topItems, explode * 0.045, cutaway, 1)
    writeInstances(cottonBot.current, botItems, explode * -0.045, cutaway, 1)
    writeInstances(chitosan.current, chiItems, explode * 0.015, cutaway, 1)
    writeInstances(carbon.current, carbItems, explode * -0.015, cutaway, 1)
  }, [topItems, botItems, chiItems, carbItems, explode, cutaway])

  if (!show) return null

  const sphereR = dp / 2

  return (
    <group>
      <instancedMesh
        ref={cottonTop}
        args={[undefined, undefined, topItems.length]}
        frustumCulled={false}
      >
        <capsuleGeometry args={[0.0022, 0.007, 4, 8]} />
        <meshStandardMaterial
          color={COTTON_COLOR}
          roughness={0.92}
          {...clip}
        />
      </instancedMesh>
      <instancedMesh
        ref={chitosan}
        args={[undefined, undefined, chiItems.length]}
        frustumCulled={false}
        castShadow
      >
        <sphereGeometry args={[sphereR, 10, 8]} />
        <meshStandardMaterial
          color={CHITOSAN_COLOR}
          roughness={0.42}
          metalness={0.04}
          {...clip}
        />
      </instancedMesh>
      <instancedMesh
        ref={carbon}
        args={[undefined, undefined, carbItems.length]}
        frustumCulled={false}
      >
        <icosahedronGeometry args={[0.0032, 0]} />
        <meshStandardMaterial
          color={CARBON_COLOR}
          roughness={0.95}
          metalness={0.08}
          {...clip}
        />
      </instancedMesh>
      <instancedMesh
        ref={cottonBot}
        args={[undefined, undefined, botItems.length]}
        frustumCulled={false}
      >
        <capsuleGeometry args={[0.002, 0.006, 4, 8]} />
        <meshStandardMaterial
          color={COTTON_COLOR}
          roughness={0.9}
          {...clip}
        />
      </instancedMesh>
    </group>
  )
}
