import { kgM3ToMgL, m3sToMlMin, m3ToMl } from '../sim/units'
import { useSimStore } from '../state/useSimStore'

function Readout({
  label,
  value,
  unit,
}: {
  label: string
  value: string
  unit: string
}) {
  return (
    <div className="mobile-readout">
      <span>{label}</span>
      <strong>
        {value} <small>{unit}</small>
      </strong>
    </div>
  )
}

/**
 * Lecturas compactas para pantallas estrechas. En móvil sustituyen a las
 * tarjetas ancladas a la escena, que quedarían fuera del encuadre.
 */
export function MobileReadouts() {
  const show = useSimStore((s) => s.showMeasurements)
  const continuousFeed = useSimStore((s) => s.continuousFeed)
  const engine = useSimStore((s) => s.engine)

  if (!show) return null

  return (
    <div className="mobile-readouts">
      <Readout
        label="Caudal"
        value={m3sToMlMin(engine.Q).toFixed(1)}
        unit="mL/min"
      />
      <Readout
        label={continuousFeed ? 'Vol. alimentado' : 'Vol. tratado'}
        value={m3ToMl(engine.Veff).toFixed(0)}
        unit="mL"
      />
      <Readout
        label="Eficiencia η"
        value={engine.eta.toFixed(1)}
        unit="%"
      />
      <Readout
        label="Tiempo exp."
        value={(engine.t / 60).toFixed(1)}
        unit="min"
      />
      <Readout
        label="C salida"
        value={kgM3ToMgL(engine.C).toFixed(2)}
        unit="mg/L"
      />
      <Readout label="ΔP Ergun" value={engine.dP.toFixed(2)} unit="Pa" />
    </div>
  )
}
