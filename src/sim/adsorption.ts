/**
 * Modelo de Thomas para lecho fijo:
 * C/C0 = 1 / [1 + exp( kTh (qm M − C0 Veff) / Q )]
 * Todas las magnitudes en SI (ver parameters.ts).
 */
export function thomasRatio(
  kTh: number,
  qm: number,
  mass: number,
  C0: number,
  Veff: number,
  Q: number,
): number {
  if (C0 <= 0) return 0
  if (Q <= 1e-16) return 0
  const exponent = (kTh * (qm * mass - C0 * Veff)) / Q
  if (exponent > 40) return 0
  if (exponent < -40) return 1
  return 1 / (1 + Math.exp(exponent))
}

export function outletConcentration(
  kTh: number,
  qm: number,
  mass: number,
  C0: number,
  Veff: number,
  Q: number,
): number {
  return C0 * thomasRatio(kTh, qm, mass, C0, Veff, Q)
}

export function removalEfficiency(C0: number, C: number): number {
  if (C0 <= 0) return 0
  return ((C0 - C) / C0) * 100
}

/**
 * Concentración local a lo largo del eje: C0 encima del quitosano,
 * transición logística normalizada en el lecho, C_out debajo.
 *
 * La logística se normaliza para que valga exactamente 0 en el borde
 * superior del lecho y 1 en el inferior, evitando saltos en los extremos.
 */
export function localConcentration(
  y: number,
  chitosanY0: number,
  chitosanY1: number,
  C0: number,
  Cout: number,
): number {
  if (y >= chitosanY1) return C0
  if (y <= chitosanY0) return Cout

  const height = Math.max(1e-9, chitosanY1 - chitosanY0)
  const t = (chitosanY1 - y) / height // 0 arriba, 1 abajo
  const steepness = 9

  const logistic = (x: number) => 1 / (1 + Math.exp(-steepness * (x - 0.5)))
  const lo = logistic(0)
  const hi = logistic(1)
  const frac = (logistic(t) - lo) / Math.max(1e-12, hi - lo)

  return C0 + (Cout - C0) * Math.min(1, Math.max(0, frac))
}
