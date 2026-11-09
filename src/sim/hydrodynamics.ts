import { SPHERICITY, WATER_20C } from './parameters'

/**
 * Ecuación de Ergun: pérdida de presión por unidad de longitud en lecho empacado.
 * ΔP/L = 150 μ (1-ε)² / (Φs² dp² ε³) · vs  +  1.75 ρ (1-ε) / (Φs dp ε³) · vs²
 */
export function ergunPressureGradient(
  vs: number,
  porosity: number,
  dp: number,
): number {
  const eps = Math.min(0.9, Math.max(0.2, porosity))
  const d = Math.max(dp, 1e-6)
  const oneMe = 1 - eps
  const denomVisc = SPHERICITY ** 2 * d ** 2 * eps ** 3
  const denomInert = SPHERICITY * d * eps ** 3
  const viscous = (150 * WATER_20C.mu * oneMe ** 2) / denomVisc
  const inertial = (1.75 * WATER_20C.rho * oneMe) / denomInert
  return viscous * vs + inertial * vs * vs
}

export function ergunDeltaP(
  vs: number,
  porosity: number,
  dp: number,
  length: number,
): number {
  return ergunPressureGradient(vs, porosity, dp) * length
}

/**
 * Velocidad superficial que produce un ΔP dado (raíz física de la cuadrática de Ergun).
 *  a vs² + b vs − (ΔP/L) = 0
 */
export function superficialVelocityForDeltaP(
  deltaP: number,
  porosity: number,
  dp: number,
  length: number,
): number {
  if (deltaP <= 0 || length <= 0) return 0
  const eps = Math.min(0.9, Math.max(0.2, porosity))
  const d = Math.max(dp, 1e-6)
  const oneMe = 1 - eps
  const a = (1.75 * WATER_20C.rho * oneMe) / (SPHERICITY * d * eps ** 3)
  const b =
    (150 * WATER_20C.mu * oneMe ** 2) / (SPHERICITY ** 2 * d ** 2 * eps ** 3)
  const target = deltaP / length
  const disc = b * b + 4 * a * target
  if (disc < 0 || a <= 0) return 0
  return (-b + Math.sqrt(disc)) / (2 * a)
}
