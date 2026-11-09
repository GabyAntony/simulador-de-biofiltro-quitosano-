import { Camera, Vector3 } from 'three'

/**
 * Registro de etiquetas HTML ancladas a la escena.
 *
 * Las etiquetas viven en el árbol React principal (junto al canvas), nunca
 * dentro del reconciler de R3F: así no hay portales anidados ni árboles
 * React secundarios que puedan montarse vacíos. Este módulo solo calcula la
 * posición en pantalla de cada ancla; lo llama el ticker 3D cada fotograma.
 */
export type OverlayAnchor = {
  position: [number, number, number]
  distanceFactor: number
  el: HTMLElement | null
}

const anchors = new Set<OverlayAnchor>()
const point = new Vector3()

export function registerOverlay(anchor: OverlayAnchor): () => void {
  anchors.add(anchor)
  return () => {
    anchors.delete(anchor)
  }
}

/** Escribe transformación, escala y z-index de cada ancla en pantalla. */
export function updateOverlays(
  camera: Camera,
  size: { width: number; height: number },
) {
  const fov =
    'fov' in camera && typeof camera.fov === 'number' ? camera.fov : 45
  // Ordenación por profundidad equivalente a la de drei <Html>.
  const range = 16777271
  const near =
    'near' in camera && typeof camera.near === 'number' ? camera.near : 0.01
  const far =
    'far' in camera && typeof camera.far === 'number' ? camera.far : 1000
  const k = -range / Math.max(1e-6, far - near)
  const zBase = -k * far

  for (const anchor of anchors) {
    const el = anchor.el
    if (!el) continue
    point.set(anchor.position[0], anchor.position[1], anchor.position[2])
    const dist = camera.position.distanceTo(point)
    point.project(camera)
    if (point.z > 1) {
      el.style.visibility = 'hidden'
      continue
    }
    const scale =
      anchor.distanceFactor /
      (2 * Math.tan((fov * Math.PI) / 360) * Math.max(0.05, dist))
    const x = (point.x * 0.5 + 0.5) * size.width
    const y = (-point.y * 0.5 + 0.5) * size.height
    const z = String(Math.round(zBase + k * dist))
    if (el.style.zIndex !== z) el.style.zIndex = z
    el.style.visibility = 'visible'
    el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale}) translate(-50%, -50%)`
  }
}
