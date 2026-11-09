import { useFrame, useThree } from '@react-three/fiber'
import { updateOverlays } from './overlays'

/**
 * Sincroniza las etiquetas HTML del árbol principal con la cámara3D.
 * Se ejecuta tras actualizar OrbitControls, así la proyección del fotograma
 * actual siempre corresponde a la cámara ya movida.
 */
export function OverlayTicker() {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)

  useFrame(() => {
    updateOverlays(camera, size)
  })

  return null
}
