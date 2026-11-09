import { GEO } from '../sim/geometry'

/**
 * Soporte de laboratorio para la columna. Sin él, la columna y el vaso
 * quedarían suspendidos sobre la mesa.
 */
export function LabStand() {
  const { stand, column } = GEO
  const armLength = Math.abs(stand.x) - column.outerR - 0.002
  const armCenterX = stand.x + armLength / 2
  const ringRadius = column.outerR + 0.004

  return (
    <group>
      <mesh
        position={[stand.x, stand.baseH / 2, stand.z]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[stand.baseW, stand.baseH, stand.baseD]} />
        <meshStandardMaterial color="#5f6a75" metalness={0.45} roughness={0.42} />
      </mesh>

      <mesh position={[stand.x, stand.rodH / 2, stand.z]} castShadow>
        <cylinderGeometry args={[stand.rodR, stand.rodR, stand.rodH, 18]} />
        <meshStandardMaterial color="#7b8792" metalness={0.6} roughness={0.3} />
      </mesh>

      {stand.clampYs.map((y) => (
        <group key={y}>
          <mesh
            position={[armCenterX, y, stand.z]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[stand.armR, stand.armR, armLength, 12]} />
            <meshStandardMaterial
              color="#7b8792"
              metalness={0.6}
              roughness={0.3}
            />
          </mesh>
          <mesh position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[ringRadius, 0.003, 8, 24]} />
            <meshStandardMaterial
              color="#4d5862"
              metalness={0.5}
              roughness={0.35}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}
