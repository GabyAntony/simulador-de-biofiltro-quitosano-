import { valveAreaMax } from '../sim/geometry'
import { torricelliFlow } from '../sim/flow'
import {
  DISCHARGE_COEFFICIENT,
  SLIDER_RANGES,
  THOMAS_LITERATURE,
} from '../sim/parameters'
import {
  gToKg,
  kgM3ToMgL,
  kgToG,
  m3sToMlMin,
  mgLToKgM3,
  mmToM,
  mToMm,
} from '../sim/units'
import { useSimStore } from '../state/useSimStore'

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  format,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (v: number) => void
  format?: (v: number) => string
}) {
  return (
    <label className="slider-row">
      <span className="slider-label">
        {label}
        <em>
          {format ? format(value) : value} {unit}
        </em>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  )
}

export function ControlPanel() {
  const running = useSimStore((s) => s.running)
  const valveOpening = useSimStore((s) => s.valveOpening)
  const C0 = useSimStore((s) => s.C0)
  const chitosanMass = useSimStore((s) => s.chitosanMass)
  const particleDiameter = useSimStore((s) => s.particleDiameter)
  const porosity = useSimStore((s) => s.porosity)
  const timeScale = useSimStore((s) => s.timeScale)
  const cutaway = useSimStore((s) => s.cutaway)
  const exploded = useSimStore((s) => s.exploded)
  const showLayers = useSimStore((s) => s.showLayers)
  const showVectors = useSimStore((s) => s.showVectors)
  const showMeasurements = useSimStore((s) => s.showMeasurements)
  const continuousFeed = useSimStore((s) => s.continuousFeed)
  const h = useSimStore((s) => s.engine.h)
  const Q = useSimStore((s) => s.engine.Q)
  const hydraulicLimited = useSimStore((s) => s.engine.hydraulicLimited)
  const overflow = useSimStore((s) => s.engine.overflow)
  const reservoirEmpty = useSimStore(
    (s) => s.engine.reservoirVolume <= 1e-9,
  )

  const qMax = torricelliFlow(DISCHARGE_COEFFICIENT, valveAreaMax, h)
  const flowSlider = m3sToMlMin(valveOpening * qMax)

  return (
    <aside className="panel">
      <header>
        <h1>Biofiltro de quitosano</h1>
        <p>Simulador de lecho fijo · violeta de cristal</p>
      </header>

      <div className="btn-row">
        <button
          type="button"
          className="primary"
          onClick={() => useSimStore.getState().start()}
          disabled={running}
        >
          Iniciar
        </button>
        <button
          type="button"
          onClick={() => useSimStore.getState().pause()}
          disabled={!running}
        >
          Pausar
        </button>
        <button type="button" onClick={() => useSimStore.getState().reset()}>
          Reiniciar
        </button>
      </div>

      {(hydraulicLimited || overflow || reservoirEmpty) && (
        <div className="warnings" role="status" aria-live="polite">
          {hydraulicLimited && (
            <p className="warning">
              ΔP del lecho mayor que la carga disponible: el caudal queda
              limitado por la permeabilidad.
            </p>
          )}
          {overflow && (
            <p className="warning">
              El vaso de salida se llenó: parte del efluente se desborda.
            </p>
          )}
          {reservoirEmpty && (
            <p className="warning">
              Reservorio vacío: no hay flujo de entrada. Reinicia para
              recargarlo.
            </p>
          )}
        </div>
      )}

      <section>
        <h2>Parámetros</h2>
        <label className="check-row">
          <input
            type="checkbox"
            checked={continuousFeed}
            onChange={(e) =>
              useSimStore.getState().setContinuousFeed(e.target.checked)
            }
          />
          <span>Alimentación continua</span>
        </label>
        <p className="hint">
          {continuousFeed
            ? 'El reservorio se mantiene lleno y el caudal es estable; el efluente va a desagüe. Así se alcanza la curva de ruptura.'
            : 'Se usan los 250 mL del reservorio visible. Baja la escala de tiempo para observar el vaciado.'}
        </p>
        <SliderRow
          label="Apertura de válvula"
          unit="%"
          value={valveOpening}
          format={(v) => (v * 100).toFixed(0)}
          {...SLIDER_RANGES.valveOpening}
          onChange={(v) => useSimStore.getState().setValveOpening(v)}
        />
        <SliderRow
          label="Caudal objetivo"
          unit="mL/min"
          value={Number(flowSlider.toFixed(1))}
          format={(v) => v.toFixed(1)}
          {...SLIDER_RANGES.flowMlMin}
          onChange={(v) => useSimStore.getState().setFlowMlMin(v)}
        />
        <p className="hint">
          Caudal físico actual (Torricelli): {m3sToMlMin(Q).toFixed(2)} mL/min.{' '}
          {continuousFeed
            ? 'Con alimentación continua el caudal se mantiene estable.'
            : 'El caudal real baja a medida que se vacía el reservorio.'}
        </p>
        <SliderRow
          label="Concentración inicial C₀"
          unit="mg/L"
          value={kgM3ToMgL(C0)}
          {...SLIDER_RANGES.C0_mgL}
          onChange={(v) => useSimStore.getState().setC0(mgLToKgM3(v))}
        />
        <SliderRow
          label="Masa de quitosano"
          unit="g"
          value={kgToG(chitosanMass)}
          {...SLIDER_RANGES.chitosanMass_g}
          onChange={(v) => useSimStore.getState().setChitosanMass(gToKg(v))}
        />
        <SliderRow
          label="Diámetro de esferas"
          unit="mm"
          value={Number(mToMm(particleDiameter).toFixed(1))}
          {...SLIDER_RANGES.particleDiameter_mm}
          onChange={(v) =>
            useSimStore.getState().setParticleDiameter(mmToM(v))
          }
        />
        <SliderRow
          label="Porosidad del lecho ε"
          unit=""
          value={porosity}
          format={(v) => v.toFixed(2)}
          {...SLIDER_RANGES.porosity}
          onChange={(v) => useSimStore.getState().setPorosity(v)}
        />
        <SliderRow
          label="Escala de tiempo"
          unit="×"
          value={timeScale}
          format={(v) => v.toFixed(0)}
          {...SLIDER_RANGES.timeScale}
          onChange={(v) => useSimStore.getState().setTimeScale(v)}
        />
      </section>

      <section>
        <h2>Vistas</h2>
        <div className="btn-grid">
          <button
            type="button"
            className={cutaway ? 'on' : ''}
            onClick={() => useSimStore.getState().setCutaway(!cutaway)}
          >
            Vista de corte
          </button>
          <button
            type="button"
            className={exploded ? 'on' : ''}
            onClick={() => useSimStore.getState().setExploded(!exploded)}
          >
            Despiece
          </button>
          <button
            type="button"
            className={showLayers ? 'on' : ''}
            onClick={() => useSimStore.getState().setShowLayers(!showLayers)}
          >
            Capas
          </button>
          <button
            type="button"
            className={showVectors ? 'on' : ''}
            onClick={() => useSimStore.getState().setShowVectors(!showVectors)}
          >
            Vectores de flujo
          </button>
          <button
            type="button"
            className={showMeasurements ? 'on' : ''}
            onClick={() =>
              useSimStore.getState().setShowMeasurements(!showMeasurements)
            }
          >
            Mediciones
          </button>
        </div>
      </section>

      <details className="sources">
        <summary>Alcance y fuentes de los parámetros</summary>
        <p>
          Los valores científicos son referencias bibliográficas, no resultados
          experimentales de este simulador.
        </p>
        <p>
          <strong>qm = {THOMAS_LITERATURE.qm_mg_g} mg/g.</strong>{' '}
          {THOMAS_LITERATURE.dye} sobre quitosano–bentonita reticulado, ensayo
          por lotes (Langmuir). Vithalkar y Jugade (2020),{' '}
          <em>Materials Today: Proceedings</em>, 29, 1025–1032.
        </p>
        <p>
          <strong>
            kTh = {THOMAS_LITERATURE.kTh_L_mg_min} L mg⁻¹ min⁻¹.
          </strong>{' '}
          Columna de lecho fijo con violeta de cristal. Bharathi y Ramesh
          (2013), <em>Applied Water Science</em>. Condiciones reportadas:
          caudal de {THOMAS_LITERATURE.columnReference.flow_mL_min} mL/min y
          lecho de {THOMAS_LITERATURE.columnReference.bedHeight_cm} cm; se usa
          como orden de magnitud, no como un ajuste de este equipo.
        </p>
        <p>{THOMAS_LITERATURE.provenanceNote}</p>
        <p>
          Agua a 20 °C. Coeficiente de descarga Cd = {DISCHARGE_COEFFICIENT}{' '}
          (orificio de bordes vivos, valor típico de ingeniería).
        </p>
      </details>
    </aside>
  )
}
