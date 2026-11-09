import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { registerOverlay, type OverlayAnchor } from '../scene/overlays'

const ANCHOR_STYLE: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  transformOrigin: '0 0',
  visibility: 'hidden',
}

/**
 * Etiqueta HTML anclada a un punto de la escena3D.
 *
 * Se renderiza en el árbol React principal; el ticker3D escribe su
 * transformación cada fotograma. A diferencia de drei <Html>, no crea árboles
 * React anidados: el contenido se compone con React de forma normal.
 */
export function SceneOverlay({
  position,
  distanceFactor = 1,
  className,
  children,
}: {
  position: [number, number, number]
  /** Escala de la etiqueta con la distancia, como en drei <Html>. */
  distanceFactor?: number
  className?: string
  children: ReactNode
}) {
  const elRef = useRef<HTMLDivElement>(null)
  const anchorRef = useRef<OverlayAnchor>({
    position,
    distanceFactor,
    el: null,
  })

  // Mantiene la ancla sincronizada con las props (se recalculan al arrastrar
  // la sonda o cambiar el motor).
  useEffect(() => {
    anchorRef.current.position = position
    anchorRef.current.distanceFactor = distanceFactor
  }, [position, distanceFactor])

  useEffect(() => {
    const anchor = anchorRef.current
    anchor.el = elRef.current
    return registerOverlay(anchor)
  }, [])

  return (
    <div ref={elRef} className={className} style={ANCHOR_STYLE}>
      {children}
    </div>
  )
}
