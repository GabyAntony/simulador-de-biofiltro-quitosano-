/** Conversiones SI ↔ unidades de laboratorio. El motor trabaja solo en SI. */

export const ML_TO_M3 = 1e-6
export const M3_TO_ML = 1e6
export const MG_L_TO_KG_M3 = 1e-3
export const KG_M3_TO_MG_L = 1e3
export const G_TO_KG = 1e-3
export const KG_TO_G = 1e3
export const MM_TO_M = 1e-3
export const M_TO_MM = 1e3
export const MIN_TO_S = 60
export const ML_MIN_TO_M3_S = 1e-6 / 60
export const M3_S_TO_ML_MIN = 60 / 1e-6

export function mlToM3(ml: number): number {
  return ml * ML_TO_M3
}

export function m3ToMl(m3: number): number {
  return m3 * M3_TO_ML
}

export function mgLToKgM3(mgL: number): number {
  return mgL * MG_L_TO_KG_M3
}

export function kgM3ToMgL(kgM3: number): number {
  return kgM3 * KG_M3_TO_MG_L
}

export function gToKg(g: number): number {
  return g * G_TO_KG
}

export function kgToG(kg: number): number {
  return kg * KG_TO_G
}

export function mmToM(mm: number): number {
  return mm * MM_TO_M
}

export function mToMm(m: number): number {
  return m * M_TO_MM
}

export function mlMinToM3s(mlMin: number): number {
  return mlMin * ML_MIN_TO_M3_S
}

export function m3sToMlMin(m3s: number): number {
  return m3s * M3_S_TO_ML_MIN
}

/**
 * kTh en L mg⁻¹ min⁻¹ → m³ kg⁻¹ s⁻¹
 * 1 L = 1e-3 m³; 1 mg = 1e-6 kg; 1 min = 60 s
 * factor = (1e-3) / (1e-6) / 60 = 1000/60 = 16.666… 
 */
export function kThLitToSi(L_mg_min: number): number {
  return L_mg_min * (1e-3 / 1e-6 / 60)
}

/** qm en mg g⁻¹ → kg kg⁻¹ (adimensional de masa) */
export function qmMgGToSi(mg_g: number): number {
  return mg_g * 1e-3
}
