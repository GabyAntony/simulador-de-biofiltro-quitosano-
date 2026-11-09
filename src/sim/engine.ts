import { outletConcentration, removalEfficiency } from './adsorption'
import { torricelliFlow } from './flow'
import {
  beakerMaxVolume,
  bedArea,
  packedBedLength,
  reservoirArea,
  reservoirMaxVolume,
  valveAreaMax,
} from './geometry'
import { ergunDeltaP, superficialVelocityForDeltaP } from './hydrodynamics'
import {
  DEFAULTS,
  DISCHARGE_COEFFICIENT,
  THOMAS_SI,
  WATER_20C,
} from './parameters'

export type HistoryPoint = {
  t: number
  C: number
  C0: number
  eta: number
  Q: number
  Veff: number
}

export type EngineState = {
  t: number
  Q: number
  vs: number
  h: number
  dP: number
  Veff: number
  C: number
  C0: number
  eta: number
  reservoirVolume: number
  collectorVolume: number
  /** El caudal se redujo porque ΔP del lecho superó la carga disponible. */
  hydraulicLimited: boolean
  /** El vaso de salida llegó a su capacidad y parte del efluente se desborda. */
  overflow: boolean
  lastSampleT: number
  history: HistoryPoint[]
}

export type EngineInputs = {
  valveOpening: number
  C0: number
  chitosanMass: number
  particleDiameter: number
  porosity: number
  timeScale: number
  /**
   * Alimentación continua: el reservorio se mantiene lleno y el efluente va a
   * desagüe. Sin ella se usan los 250 mL finitos del reservorio visible.
   */
  continuousFeed: boolean
}

const HISTORY_CAP = 300
const SAMPLE_EVERY_S = 2

export function initialEngineState(C0: number): EngineState {
  return {
    t: 0,
    Q: 0,
    vs: 0,
    h: DEFAULTS.reservoirVolume / reservoirArea,
    dP: 0,
    Veff: 0,
    C: 0,
    C0,
    eta: 100,
    reservoirVolume: DEFAULTS.reservoirVolume,
    collectorVolume: 0,
    hydraulicLimited: false,
    overflow: false,
    lastSampleT: -SAMPLE_EVERY_S,
    history: [],
  }
}

export function stepEngine(
  state: EngineState,
  inputs: EngineInputs,
  dtWall: number,
): EngineState {
  const dt = Math.min(0.05, Math.max(0, dtWall)) * inputs.timeScale
  if (dt <= 0) return state

  // Con alimentación continua el nivel del reservorio se mantiene en su
  // volumen inicial, como si una bomba lo recargara desde un tanque mayor.
  const feedVolume = inputs.continuousFeed
    ? DEFAULTS.reservoirVolume
    : state.reservoirVolume
  const h = Math.max(0, feedVolume / reservoirArea)
  const A_valv = Math.min(1, Math.max(0, inputs.valveOpening)) * valveAreaMax
  let Q = torricelliFlow(DISCHARGE_COEFFICIENT, A_valv, h)

  let vs = Q / bedArea
  let dP = ergunDeltaP(vs, inputs.porosity, inputs.particleDiameter, packedBedLength)
  let hydraulicLimited = false

  if (feedVolume > 1e-9) {
    const available = WATER_20C.rho * WATER_20C.g * h
    if (dP > available && available > 0) {
      vs = superficialVelocityForDeltaP(
        available,
        inputs.porosity,
        inputs.particleDiameter,
        packedBedLength,
      )
      Q = vs * bedArea
      dP = available
      hydraulicLimited = true
    }
  } else {
    Q = 0
    vs = 0
    dP = 0
  }

  const dV = Q * dt
  const actualDV = inputs.continuousFeed
    ? dV
    : Math.min(dV, state.reservoirVolume)
  const actualQ = dt > 0 ? actualDV / dt : 0
  const Veff = state.Veff + actualDV
  const reservoirVolume = inputs.continuousFeed
    ? DEFAULTS.reservoirVolume
    : Math.min(
        reservoirMaxVolume,
        Math.max(0, state.reservoirVolume - actualDV),
      )

  // En continuo el efluente va a desagüe: no se acumula en el vaso.
  let collectorVolume = 0
  let overflow = false
  if (!inputs.continuousFeed) {
    const rawCollectorVolume = state.collectorVolume + actualDV
    overflow = rawCollectorVolume > beakerMaxVolume + 1e-12
    collectorVolume = Math.min(beakerMaxVolume, rawCollectorVolume)
  }

  const t = state.t + dt

  const C =
    actualQ > 1e-16
      ? outletConcentration(
          THOMAS_SI.kTh,
          THOMAS_SI.qm,
          inputs.chitosanMass,
          inputs.C0,
          Veff,
          actualQ,
        )
      : state.C
  const eta = removalEfficiency(inputs.C0, C)

  let history = state.history
  let lastSampleT = state.lastSampleT
  if (t - lastSampleT >= SAMPLE_EVERY_S) {
    lastSampleT = t
    history = [
      ...history,
      { t, C, C0: inputs.C0, eta, Q: actualQ, Veff },
    ]
    if (history.length > HISTORY_CAP) {
      history = history.slice(history.length - HISTORY_CAP)
    }
  }

  return {
    t,
    Q: actualQ,
    vs: actualQ / bedArea,
    h: reservoirVolume / reservoirArea,
    dP,
    Veff,
    C,
    C0: inputs.C0,
    eta,
    reservoirVolume,
    collectorVolume,
    hydraulicLimited,
    overflow,
    lastSampleT,
    history,
  }
}
