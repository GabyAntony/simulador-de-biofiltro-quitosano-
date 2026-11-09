import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group } from 'three'
import { columnTopY, GEO, packingFloorY } from '../sim/geometry'
import { engineRef, useSimStore } from '../state/useSimStore'

const N = 7
const CONE_HEIGHT = 0.02

/**
 * Flechas de velocidad en el lecho. La longitud se escala con la velocidad
 * superficial real (m/s) y las flechas descienden para indicar el sentido
 * del flujo. Con caudales de laboratorio vs es ~10⁻⁴ m/s, por lo que se usa
 * un factor de escala visual, no una equivalencia geométrica.
 */
export function FlowVectors() {
  const group = useRef<Group>(null)
  const flowTime = useRef(0)
  const show = useSimStore((s) => s.showVectors)

  const ys = useMemo(() => {
    const list: number[] = []
    const span = columnTopY - packingFloorY - 0.04
    for (let i = 0; i < N; i += 1) {
      list.push(columnTopY - 0.02 - (span * i) / (N - 1))
    }
    return list
  }, [])

  const spacing = useMemo(
    () => (columnTopY - packingFloorY - 0.04) / (N - 1),
    [],
  )

  useFrame((_, dt) => {
    if (!group.current || !show) return
    const engine = engineRef.current
    const { running } = useSimStore.getState()
    const vs = engine.vs
    const flowing = running && engine.Q > 1e-12
    if (flowing) flowTime.current += dt * (0.35 + vs * 700)
    const length = 0.012 + Math.min(0.055, vs * 420)
    const phase = flowTime.current % 1

    group.current.children.forEach((child, index) => {
      child.position.set(
        -GEO.column.innerR * 0.35,
        ys[index] - phase * spacing * 0.35,
        0.012,
      )
      child.scale.set(1, length / CONE_HEIGHT, 1)
    })
  })

  if (!show) return null

  return (
    <group ref={group}>
      {ys.map((y) => (
        <mesh key={y} position={[0.01, y, 0.01]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.0045, CONE_HEIGHT, 10]} />
          <meshStandardMaterial
            color="#1f6f8b"
            emissive="#0f3a49"
            emissiveIntensity={0.6}
            roughness={0.4}
          />
        </mesh>
      ))}
    </group>
  )
}
