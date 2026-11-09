import { useMemo } from 'react'
import {
  CatmullRomCurve3,
  DoubleSide,
  type Plane,
  TubeGeometry,
  Vector3,
} from 'three'
import {
  columnTopY,
  GEO,
  reservoirBottomY,
  reservoirTopY,
} from '../sim/geometry'
import { clipProps } from './materials'

type Props = {
  valveOpening: number
  explode: number
  clippingPlanes: Plane[] | null
  clipped: boolean
}

export function Plumbing({
  valveOpening,
  explode,
  clippingPlanes,
  clipped,
}: Props) {
  const clip = clipProps(clippingPlanes, clipped)

  const inlet = useMemo(() => {
    const pts = [
      new Vector3(-GEO.reservoir.outerR * 0.2, reservoirTopY - 0.012, 0),
      new Vector3(-GEO.reservoir.outerR - 0.02, reservoirTopY - 0.01, 0.01),
      new Vector3(-0.09, columnTopY + 0.02, 0.04),
      new Vector3(-0.055, columnTopY + 0.008, 0.01),
      new Vector3(0, columnTopY - 0.004, 0),
    ]
    const curve = new CatmullRomCurve3(pts)
    return new TubeGeometry(curve, 48, GEO.hoseRadius, 12, false)
  }, [])

  const outlet = useMemo(() => {
    const pts = [
      new Vector3(0, GEO.column.bottomY + 0.004, 0),
      new Vector3(0.02, GEO.column.bottomY - 0.02, 0.01),
      new Vector3(
        GEO.beaker.x - 0.01,
        GEO.beaker.bottomY + GEO.beaker.height + 0.02,
        GEO.beaker.z,
      ),
      new Vector3(
        GEO.beaker.x,
        GEO.beaker.bottomY + GEO.beaker.height + 0.004,
        GEO.beaker.z,
      ),
    ]
    const curve = new CatmullRomCurve3(pts)
    return new TubeGeometry(curve, 40, GEO.hoseRadius * 0.9, 12, false)
  }, [])

  const valveY = columnTopY + 0.028 + explode * 0.08
  const valveX = -0.078

  return (
    <group>
      <mesh geometry={inlet} position={[0, explode * 0.08, 0]} castShadow>
        <meshStandardMaterial color="#3d6d7a" roughness={0.45} {...clip} />
      </mesh>
      <mesh geometry={outlet} castShadow>
        <meshStandardMaterial color="#3d6d7a" roughness={0.45} />
      </mesh>

      <group position={[valveX, valveY, 0.035]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.011, 0.004, 12, 24]} />
          <meshStandardMaterial color="#c9a227" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh rotation={[0, 0, (1 - valveOpening) * (Math.PI / 2)]}>
          <boxGeometry args={[0.028, 0.004, 0.008]} />
          <meshStandardMaterial color="#b11f3a" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.006, 16, 12]} />
          <meshStandardMaterial color="#d8dde2" metalness={0.5} roughness={0.25} />
        </mesh>
      </group>

      <mesh position={[0, reservoirBottomY + explode * 0.1, 0]}>
        <cylinderGeometry args={[0.012, 0.018, 0.01, 24]} />
        <meshStandardMaterial color="#8a96a0" metalness={0.4} roughness={0.35} {...clip} />
      </mesh>
      <mesh position={[0, GEO.column.bottomY - 0.002 + explode * -0.06, 0]}>
        <cylinderGeometry args={[0.016, 0.01, 0.012, 24]} />
        <meshStandardMaterial color="#8a96a0" metalness={0.4} roughness={0.35} />
      </mesh>

      <mesh
        position={[0, columnTopY + explode * 0.09, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[GEO.column.outerR + 0.002, 0.0045, 10, 28]} />
        <meshStandardMaterial color="#6b7680" metalness={0.35} roughness={0.4} />
      </mesh>
      <mesh
        position={[0, GEO.column.bottomY + explode * -0.06, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[GEO.column.outerR + 0.002, 0.0045, 10, 28]} />
        <meshStandardMaterial color="#6b7680" metalness={0.35} roughness={0.4} />
      </mesh>

      <mesh
        position={[
          GEO.beaker.x,
          GEO.beaker.bottomY + GEO.beaker.height + 0.004,
          GEO.beaker.z,
        ]}
        rotation={[Math.PI / 2, 0, Math.PI / 5]}
      >
        <torusGeometry args={[0.018, 0.003, 8, 16, Math.PI]} />
        <meshPhysicalMaterial
          color="#dfeaf1"
          roughness={0.1}
          transmission={0.6}
          transparent
          opacity={0.5}
          side={DoubleSide}
        />
      </mesh>
    </group>
  )
}
