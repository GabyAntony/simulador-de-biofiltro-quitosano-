import { DoubleSide, type Plane } from 'three'
import { clipProps, GLASS, PET } from './materials'

type Props = {
  innerR: number
  outerR: number
  height: number
  yBottom: number
  kind: 'pet' | 'glass'
  radialSegments?: number
  openTop?: boolean
  capOffsetTop?: number
  capOffsetBottom?: number
  clippingPlanes: Plane[] | null
  clipped: boolean
}

export function GlassVessel({
  innerR,
  outerR,
  height,
  yBottom,
  kind,
  radialSegments = 48,
  openTop = false,
  capOffsetTop = 0,
  capOffsetBottom = 0,
  clippingPlanes,
  clipped,
}: Props) {
  const mat = kind === 'pet' ? PET : GLASS
  const clip = clipProps(clippingPlanes, clipped)
  const y = yBottom + height / 2

  return (
    <group>
      <mesh position={[0, y, 0]} castShadow>
        <cylinderGeometry
          args={[outerR, outerR, height, radialSegments, 1, true]}
        />
        <meshPhysicalMaterial {...mat} {...clip} />
      </mesh>
      <mesh position={[0, y, 0]}>
        <cylinderGeometry
          args={[innerR, innerR, height, radialSegments, 1, true]}
        />
        <meshPhysicalMaterial
          {...mat}
          {...clip}
          side={DoubleSide}
          opacity={mat.opacity * 0.85}
        />
      </mesh>
      <mesh
        position={[0, yBottom + capOffsetBottom, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[innerR, outerR, radialSegments]} />
        <meshPhysicalMaterial {...mat} {...clip} side={DoubleSide} />
      </mesh>
      {!openTop && (
        <mesh
          position={[0, yBottom + height + capOffsetTop, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[innerR * 0.15, outerR, radialSegments]} />
          <meshPhysicalMaterial {...mat} {...clip} side={DoubleSide} />
        </mesh>
      )}
    </group>
  )
}
