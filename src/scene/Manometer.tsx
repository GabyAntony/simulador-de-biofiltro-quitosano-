import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import { engineRef, useSimStore } from '../state/useSimStore'

const MAX_DP_PA = 3
const SWEEP = Math.PI * 1.5

/**
 * Manómetro de aguja para ΔP de Ergun. La escala es expandida (0–3 Pa)
 * porque el ΔP del lecho es pequeño a los caudales de laboratorio.
 */
export function Manometer() {
  const show = useSimStore((s) => s.showMeasurements)
  const needle = useRef<Group>(null)

  useFrame(() => {
    if (!needle.current) return
    const value = Math.min(1, Math.max(0, engineRef.current.dP / MAX_DP_PA))
    needle.current.rotation.z = -SWEEP / 2 + value * SWEEP
  })

  if (!show) return null

  const ticks = Array.from({ length: 5 }, (_, index) => {
    const angle = -SWEEP / 2 + (index / 4) * SWEEP
    return {
      x: Math.sin(angle) * 0.012,
      y: Math.cos(angle) * 0.012,
      angle,
    }
  })

  return (
    <group position={[0.082, 0.235, 0.02]}>
      <mesh
        position={[0.047 - 0.082, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[0.003, 0.003, 0.09, 12]} />
        <meshStandardMaterial color="#8a96a0" metalness={0.5} roughness={0.35} />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.008, 32]} />
        <meshStandardMaterial color="#3a4652" metalness={0.65} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0, 0.0045]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.0155, 0.0155, 0.001, 32]} />
        <meshStandardMaterial color="#f7fafc" roughness={0.55} />
      </mesh>

      {ticks.map((tick) => (
        <mesh
          key={tick.angle}
          position={[tick.x, tick.y, 0.006]}
          rotation={[0, 0, -tick.angle]}
        >
          <boxGeometry args={[0.0008, 0.0024, 0.0005]} />
          <meshStandardMaterial color="#5c6774" />
        </mesh>
      ))}

      <group ref={needle} position={[0, 0, 0.0065]}>
        <mesh position={[0, 0.0065, 0]}>
          <boxGeometry args={[0.0011, 0.013, 0.0008]} />
          <meshStandardMaterial color="#b11f3a" roughness={0.35} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.0017, 10, 8]} />
          <meshStandardMaterial color="#1c2430" metalness={0.4} roughness={0.3} />
        </mesh>
      </group>
    </group>
  )
}
