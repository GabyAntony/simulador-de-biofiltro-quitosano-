import { formatMgL } from '../sim/color'
import { GEO, reservoirTopY } from '../sim/geometry'
import { m3sToMlMin, m3ToMl } from '../sim/units'
import { useSimStore } from '../state/useSimStore'
import { SceneOverlay } from './SceneOverlay'

function Card({
  title,
  value,
  unit,
}: {
  title: string
  value: string
  unit: string
}) {
  return (
    <>
      <span>{title}</span>
      <strong>
        {value} <small>{unit}</small>
      </strong>
    </>
  )
}

/**
 * Tarjetas de instrumentación y etiqueta de la sonda ancladas a la escena.
 * El manómetro 3D muestra la aguja y aquí se repite ΔP como lectura numérica.
 *
 * Se renderiza en el árbol principal (fuera del canvas) para evitar los
 * portales anidados de drei <Html>; la posición la escribe el ticker3D.
 */
export function SceneOverlays() {
  const show = useSimStore((s) => s.showMeasurements)
  const continuousFeed = useSimStore((s) => s.continuousFeed)
  const engine = useSimStore((s) => s.engine)
  const probeY = useSimStore((s) => s.probeY)
  const C = useSimStore((s) => s.probeConcentration())

  if (!show) return null

  const tMin = engine.t / 60
  const probeX = GEO.column.outerR + 0.018

  return (
    <>
      <SceneOverlay
        position={[-0.16, 0.31, 0.04]}
        distanceFactor={0.9}
        className="meter-card"
      >
        <Card
          title="Caudal"
          value={m3sToMlMin(engine.Q).toFixed(1)}
          unit="mL/min"
        />
      </SceneOverlay>

      <SceneOverlay
        position={[
          GEO.beaker.x + 0.05,
          GEO.beaker.bottomY + GEO.beaker.height + 0.045,
          GEO.beaker.z,
        ]}
        distanceFactor={0.9}
        className="meter-card"
      >
        <Card
          title={continuousFeed ? 'Vol. alimentado' : 'Vol. tratado'}
          value={m3ToMl(engine.Veff).toFixed(0)}
          unit="mL"
        />
      </SceneOverlay>

      <SceneOverlay
        position={[0.105, reservoirTopY - 0.035, 0]}
        distanceFactor={0.9}
        className="meter-card"
      >
        <Card title="Eficiencia η" value={engine.eta.toFixed(1)} unit="%" />
      </SceneOverlay>

      <SceneOverlay
        position={[-0.12, reservoirTopY - 0.005, 0]}
        distanceFactor={0.9}
        className="meter-card"
      >
        <Card title="Tiempo exp." value={tMin.toFixed(1)} unit="min" />
      </SceneOverlay>

      <SceneOverlay
        position={[
          GEO.beaker.x + 0.05,
          GEO.beaker.bottomY + 0.085,
          GEO.beaker.z,
        ]}
        distanceFactor={0.9}
        className="meter-card"
      >
        <Card
          title="C salida"
          value={formatMgL(engine.C).replace(' mg/L', '')}
          unit="mg/L"
        />
      </SceneOverlay>

      <SceneOverlay
        position={[0.135, 0.225, 0.02]}
        distanceFactor={0.75}
        className="meter-card"
      >
        <Card title="ΔP Ergun" value={engine.dP.toFixed(2)} unit="Pa" />
      </SceneOverlay>

      <SceneOverlay
        position={[probeX + 0.035, probeY + 0.012, 0]}
        distanceFactor={0.65}
        className="probe-label"
      >
        Sonda
        <strong>{formatMgL(C)}</strong>
      </SceneOverlay>
    </>
  )
}
