import { kThLitToSi, mgLToKgM3, mlToM3, qmMgGToSi } from './units'
import { packedBedLength, valveAreaMax } from './geometry'

/** Agua a 20 °C (valores tabulados estándar, no medidos en este simulador). */
export const WATER_20C = {
  temperatureC: 20,
  /** Pa·s */
  mu: 1.002e-3,
  /** kg m⁻³ */
  rho: 998.2,
  /** m s⁻² */
  g: 9.80665,
} as const

/**
 * Coeficiente de descarga de orificio.
 * Valor típico de ingeniería (~0.61 para orificio de bordes vivos), no calibrado aquí.
 */
export const DISCHARGE_COEFFICIENT = 0.61

/** Esferas: factor de esfericidad de Ergun Φs = 1. */
export const SPHERICITY = 1

/**
 * Parámetros de Thomas tomados de literatura publicada.
 * NO son resultados experimentales de este simulador.
 */
export const THOMAS_LITERATURE = {
  dye: 'Violeta de cristal (C.I. 42555)',
  /**
   * Langmuir qmax = 169.49 mg g⁻¹ para CV sobre perlas de bentonita recubierta
   * de quitosano reticulado (ensayo por lotes).
   * Fuente: Vithalkar, S.H. & Jugade, R.M. (2020). Adsorptive removal of
   * crystal violet from aqueous solution by cross-linked chitosan coated
   * bentonite. Materials Today: Proceedings, 29, 1025–1032.
   * https://doi.org/10.1016/j.matpr.2020.04.705
   * Se usa como qm de referencia en el modelo de Thomas de lecho fijo.
   */
  qm_mg_g: 169.49,
  /**
   * kTh = 1.6×10⁻⁴ L mg⁻¹ min⁻¹ para CV en columna de lecho fijo
   * (10 mL min⁻¹, lecho 10 cm).
   * Fuente: Bharathi, K.S. & Ramesh, S.T. (2013). Fixed-bed column studies on
   * biosorption of crystal violet from aqueous solution by Citrullus lanatus
   * rind and Cyperus rotundus. Applied Water Science.
   * https://doi.org/10.1007/s13201-013-0103-4
   * Constante cinética de una columna de CV; orden de magnitud de kTh, no un
   * ajuste medido sobre quitosano.
   */
  kTh_L_mg_min: 1.6e-4,
  /**
   * No se encontró un único estudio abierto de lecho empacado CV/quitosano que
   * reporte simultáneamente qm y kTh. Por transparencia, el simulador usa un
   * valor compuesto: qm de equilibrio CV/quitosano (lotes) y kTh de una columna
   * de CV. Ambos son valores de referencia, no resultados de este simulador.
   */
  provenanceNote:
    'qm: Vithalkar y Jugade (2020), Langmuir por lotes de CV sobre quitosano-bentonita. kTh: Bharathi y Ramesh (2013), columna de CV (Citrullus/Cyperus). No provienen del mismo experimento; se usan como valores de referencia compuestos.',
  columnReference: {
    flow_mL_min: 10,
    bedHeight_cm: 10,
  },
} as const

export const THOMAS_SI = {
  qm: qmMgGToSi(THOMAS_LITERATURE.qm_mg_g),
  kTh: kThLitToSi(THOMAS_LITERATURE.kTh_L_mg_min),
} as const

export const SLIDER_RANGES = {
  valveOpening: { min: 0, max: 1, step: 0.01 },
  flowMlMin: { min: 0, max: 30, step: 0.1 },
  C0_mgL: { min: 5, max: 100, step: 1 },
  chitosanMass_g: { min: 5, max: 40, step: 0.5 },
  particleDiameter_mm: { min: 2, max: 8, step: 0.1 },
  porosity: { min: 0.3, max: 0.55, step: 0.01 },
  timeScale: { min: 1, max: 50000, step: 1 },
} as const

export const DEFAULTS = {
  valveOpening: 0.55,
  C0: mgLToKgM3(25),
  chitosanMass: 0.018,
  particleDiameter: 0.004,
  porosity: 0.4,
  timeScale: 8000,
  reservoirVolume: mlToM3(250),
} as const

export const PHYSICS_META = {
  bedLength: packedBedLength,
  valveAreaMax,
  Cd: DISCHARGE_COEFFICIENT,
  sphericity: SPHERICITY,
} as const
