import { create } from 'zustand'
import { layerBounds } from '../sim/geometry'
import { localConcentration } from '../sim/adsorption'
import {
  initialEngineState,
  stepEngine,
  type EngineState,
} from '../sim/engine'
import { DEFAULTS, DISCHARGE_COEFFICIENT } from '../sim/parameters'
import { valveOpeningFromFlow } from '../sim/flow'
import { reservoirArea, valveAreaMax } from '../sim/geometry'
import { mlMinToM3s } from '../sim/units'

export const engineRef = { current: initialEngineState(DEFAULTS.C0) }
let lastUiPublish = 0

export type SimStore = {
  running: boolean
  cutaway: boolean
  exploded: boolean
  showLayers: boolean
  showVectors: boolean
  showMeasurements: boolean
  probeY: number
  resetEpoch: number
  continuousFeed: boolean
  valveOpening: number
  C0: number
  chitosanMass: number
  particleDiameter: number
  porosity: number
  timeScale: number
  engine: EngineState
  start: () => void
  pause: () => void
  reset: () => void
  advance: (dtWall: number) => void
  setValveOpening: (v: number) => void
  setFlowMlMin: (mlMin: number) => void
  setC0: (v: number) => void
  setChitosanMass: (v: number) => void
  setParticleDiameter: (v: number) => void
  setPorosity: (v: number) => void
  setTimeScale: (v: number) => void
  setCutaway: (v: boolean) => void
  setExploded: (v: boolean) => void
  setShowLayers: (v: boolean) => void
  setShowVectors: (v: boolean) => void
  setShowMeasurements: (v: boolean) => void
  setProbeY: (y: number) => void
  setContinuousFeed: (v: boolean) => void
  probeConcentration: () => number
}

const inputsFrom = (s: {
  valveOpening: number
  C0: number
  chitosanMass: number
  particleDiameter: number
  porosity: number
  timeScale: number
  continuousFeed: boolean
}) => ({
  valveOpening: s.valveOpening,
  C0: s.C0,
  chitosanMass: s.chitosanMass,
  particleDiameter: s.particleDiameter,
  porosity: s.porosity,
  timeScale: s.timeScale,
  continuousFeed: s.continuousFeed,
})

export const useSimStore = create<SimStore>((set, get) => ({
  running: false,
  cutaway: false,
  exploded: false,
  showLayers: true,
  showVectors: false,
  showMeasurements: true,
  probeY: (layerBounds.chitosan.y0 + layerBounds.chitosan.y1) / 2,
  resetEpoch: 0,
  continuousFeed: true,
  valveOpening: DEFAULTS.valveOpening,
  C0: DEFAULTS.C0,
  chitosanMass: DEFAULTS.chitosanMass,
  particleDiameter: DEFAULTS.particleDiameter,
  porosity: DEFAULTS.porosity,
  timeScale: DEFAULTS.timeScale,
  engine: initialEngineState(DEFAULTS.C0),

  start: () => set({ running: true }),
  pause: () => set({ running: false }),
  reset: () => {
    lastUiPublish = 0
    const next = initialEngineState(get().C0)
    engineRef.current = next
    set((s) => ({
      running: false,
      engine: next,
      resetEpoch: s.resetEpoch + 1,
      probeY: (layerBounds.chitosan.y0 + layerBounds.chitosan.y1) / 2,
    }))
  },
  advance: (dtWall) => {
    const s = get()
    if (!s.running) return
    const engine = stepEngine(engineRef.current, inputsFrom(s), dtWall)
    engineRef.current = engine
    const now = performance.now()
    if (now - lastUiPublish > 80) {
      lastUiPublish = now
      set({ engine })
    }
  },
  setValveOpening: (v) => set({ valveOpening: v }),
  setFlowMlMin: (mlMin) => {
    const h = engineRef.current.h
    const opening = valveOpeningFromFlow(
      mlMinToM3s(mlMin),
      DISCHARGE_COEFFICIENT,
      valveAreaMax,
      h,
    )
    set({ valveOpening: opening })
  },
  setC0: (v) => set({ C0: v }),
  setChitosanMass: (v) => set({ chitosanMass: v }),
  setParticleDiameter: (v) => set({ particleDiameter: v }),
  setPorosity: (v) => set({ porosity: v }),
  setTimeScale: (v) => set({ timeScale: v }),
  setCutaway: (v) => set({ cutaway: v }),
  setExploded: (v) => set({ exploded: v }),
  setShowLayers: (v) => set({ showLayers: v }),
  setShowVectors: (v) => set({ showVectors: v }),
  setShowMeasurements: (v) => set({ showMeasurements: v }),
  setProbeY: (y) => set({ probeY: y }),
  setContinuousFeed: (v) => {
    set({ continuousFeed: v })
    if (v) {
      const next = {
        ...engineRef.current,
        reservoirVolume: DEFAULTS.reservoirVolume,
        h: DEFAULTS.reservoirVolume / reservoirArea,
      }
      engineRef.current = next
      set({ engine: next })
    }
  },
  probeConcentration: () => {
    const s = get()
    return localConcentration(
      s.probeY,
      layerBounds.chitosan.y0,
      layerBounds.chitosan.y1,
      s.C0,
      engineRef.current.C,
    )
  },
}))
