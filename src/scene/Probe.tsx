import { useThree, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Vector3 } from 'three'
import { columnTopY, GEO, packingFloorY } from '../sim/geometry'
import { useSimStore } from '../state/useSimStore'

/**
 * Sonda de concentración arrastrable.
 *
 * El arrastre usa listeners globales de puntero en lugar de depender de que
 * el puntero siga intersectando la esfera: así el gesto funciona aunque el
 * cursor se salga de la sonda o el render se acelere. Su etiqueta HTML vive
 * en `SceneOverlays` (árbol principal), fuera del canvas.
 */
export function Probe() {
  const show = useSimStore((s) => s.showMeasurements)
  const probeY = useSimStore((s) => s.probeY)
  const setProbeY = useSimStore((s) => s.setProbeY)
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const controls = useThree((s) => s.controls) as unknown as {
    enabled: boolean
  } | null

  const drag = useRef<{
    startClientY: number
    startY: number
    perPixel: number
  } | null>(null)
  const cleanup = useRef<(() => void) | null>(null)
  const controlsRef = useRef(controls)

  const x = GEO.column.outerR + 0.018

  useEffect(() => {
    controlsRef.current = controls
  }, [controls])

  useEffect(
    () => () => {
      cleanup.current?.()
      if (controlsRef.current) controlsRef.current.enabled = true
      document.body.style.cursor = 'auto'
    },
    [],
  )

  if (!show) return null

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()

    // Altura visible a la profundidad de la sonda, para convertir el
    // desplazamiento vertical en píxeles a metros de forma estable.
    const target = new Vector3(x, probeY, 0)
    const distance = camera.position.distanceTo(target)
    const fov =
      'fov' in camera && typeof camera.fov === 'number'
        ? (camera.fov * Math.PI) / 180
        : Math.PI / 4
    const visibleHeight = 2 * distance * Math.tan(fov / 2)
    const perPixel = visibleHeight / Math.max(1, size.height)

    drag.current = {
      startClientY: e.nativeEvent.clientY,
      startY: probeY,
      perPixel,
    }
    // Evita que OrbitControls rote la cámara mientras se arrastra la sonda.
    // oxlint-disable-next-line react/immutability -- OrbitControls expone `enabled` como propiedad mutable
    if (controls) controls.enabled = false
    document.body.style.cursor = 'grabbing'

    const onMove = (event: PointerEvent) => {
      const current = drag.current
      if (!current) return
      const nextY =
        current.startY -
        (event.clientY - current.startClientY) * current.perPixel
      setProbeY(
        Math.min(columnTopY - 0.01, Math.max(packingFloorY, nextY)),
      )
    }

    const onUp = () => {
      drag.current = null
      // oxlint-disable-next-line react/immutability -- OrbitControls expone `enabled` como propiedad mutable
      if (controls) controls.enabled = true
      document.body.style.cursor = 'grab'
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      if (cleanup.current === onUp) cleanup.current = null
    }

    cleanup.current?.()
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    cleanup.current = onUp
  }

  const onPointerOver = () => {
    if (!drag.current) document.body.style.cursor = 'grab'
  }
  const onPointerOut = () => {
    if (!drag.current) document.body.style.cursor = 'auto'
  }

  return (
    <group
      position={[x, probeY, 0]}
      onPointerDown={onPointerDown}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      <mesh>
        <sphereGeometry args={[0.009, 16, 12]} />
        <meshStandardMaterial color="#2c7a9b" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[-0.02, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.0018, 0.0018, 0.042, 8]} />
        <meshStandardMaterial color="#9aa7b0" metalness={0.6} roughness={0.25} />
      </mesh>
    </group>
  )
}
