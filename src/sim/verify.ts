import { outletConcentration, thomasRatio } from './adsorption'
import { initialEngineState, stepEngine } from './engine'
import { torricelliFlow } from './flow'
import { DEFAULTS, DISCHARGE_COEFFICIENT, THOMAS_SI } from './parameters'
import { valveAreaMax } from './geometry'

export type EngineCheckResult = {
  qClosed: number
  qOpen: number
  cOverC0Start: number
  cOverC0Breakthrough: number
  monotonic: boolean
  stepped: {
    t: number
    Q: number
    C: number
    eta: number
    Veff: number
  }
  continuous: {
    reservoirVolume: number
    Veff: number
    collectorVolume: number
    overflow: boolean
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message)
}

/**
 * Comprobaciones unitarias del motor, sin DOM ni WebGL.
 * Se ejecutan con `npm run verify` y también en desarrollo desde main.tsx.
 */
export function runEngineChecks(): EngineCheckResult {
  const qClosed = torricelliFlow(DISCHARGE_COEFFICIENT, 0, 0.05)
  const qOpen = torricelliFlow(DISCHARGE_COEFFICIENT, valveAreaMax, 0.05)

  assert(qClosed === 0, 'Q debe ser 0 con la válvula cerrada')
  assert(qOpen > 0, 'Q debe ser > 0 con la válvula abierta')

  const Q = Math.max(qOpen * 0.5, 1e-12)
  const cOverC0Start = thomasRatio(
    THOMAS_SI.kTh,
    THOMAS_SI.qm,
    DEFAULTS.chitosanMass,
    DEFAULTS.C0,
    0,
    Q,
  )
  const cOverC0Breakthrough = thomasRatio(
    THOMAS_SI.kTh,
    THOMAS_SI.qm,
    DEFAULTS.chitosanMass,
    DEFAULTS.C0,
    0.3,
    Q,
  )

  assert(cOverC0Start < 0.2, 'Un lecho nuevo debe empezar con C/C0 bajo')
  assert(
    cOverC0Breakthrough > 0.8,
    'Un volumen tratado grande debe acercarse al breakthrough',
  )

  let previous = -1
  let monotonic = true
  for (let i = 0; i <= 80; i += 1) {
    const Veff = (i / 80) * 0.3
    const ratio = thomasRatio(
      THOMAS_SI.kTh,
      THOMAS_SI.qm,
      DEFAULTS.chitosanMass,
      DEFAULTS.C0,
      Veff,
      Q,
    )
    if (ratio < previous - 1e-12) {
      monotonic = false
      break
    }
    previous = ratio
  }
  assert(monotonic, 'C/C0 debe ser monótono creciente con Veff')

  let s = initialEngineState(DEFAULTS.C0)
  const inputs = {
    valveOpening: 0.6,
    C0: DEFAULTS.C0,
    chitosanMass: DEFAULTS.chitosanMass,
    particleDiameter: DEFAULTS.particleDiameter,
    porosity: DEFAULTS.porosity,
    timeScale: 1,
    continuousFeed: false,
  }

  for (let i = 0; i < 200; i += 1) {
    s = stepEngine(s, inputs, 0.05)
  }

  assert(s.t > 0, 'El tiempo simulado debe avanzar')
  assert(s.Veff > 0, 'El volumen tratado debe avanzar')
  assert(Number.isFinite(s.C), 'La concentración de salida debe ser finita')
  assert(Number.isFinite(s.Q), 'El caudal debe ser finito')

  // Consistencia de la concentración de salida con el estado final.
  const computedC =
    s.Q > 1e-16
      ? outletConcentration(
          THOMAS_SI.kTh,
          THOMAS_SI.qm,
          DEFAULTS.chitosanMass,
          DEFAULTS.C0,
          s.Veff,
          s.Q,
        )
      : s.C
  assert(
    Math.abs(computedC - s.C) < 1e-9,
    'La concentración de salida debe coincidir con Thomas',
  )

  // Alimentación continua: el reservorio no se agota y el efluente va a
  // desagüe, de modo que el volumen tratado puede crecer sin límite.
  let c = initialEngineState(DEFAULTS.C0)
  const continuousInputs = {
    ...inputs,
    timeScale: 1000,
    continuousFeed: true,
  }
  for (let i = 0; i < 200; i += 1) {
    c = stepEngine(c, continuousInputs, 0.05)
  }
  assert(
    Math.abs(c.reservoirVolume - DEFAULTS.reservoirVolume) < 1e-12,
    'La alimentación continua debe mantener el reservorio lleno',
  )
  assert(c.Veff > 0.002, 'La alimentación continua debe acumular volumen')
  assert(
    c.collectorVolume === 0 && !c.overflow,
    'En continuo el efluente no debe acumularse en el vaso',
  )

  return {
    qClosed,
    qOpen,
    cOverC0Start,
    cOverC0Breakthrough,
    monotonic,
    stepped: {
      t: s.t,
      Q: s.Q,
      C: s.C,
      eta: s.eta,
      Veff: s.Veff,
    },
    continuous: {
      reservoirVolume: c.reservoirVolume,
      Veff: c.Veff,
      collectorVolume: c.collectorVolume,
      overflow: c.overflow,
    },
  }
}
