import { kgM3ToMgL } from './units'

/** Morado intenso (influente) → azul muy claro (purificado). */
export const PURPLE: [number, number, number] = [0.42, 0.07, 0.52]
export const PALE_BLUE: [number, number, number] = [0.72, 0.88, 0.95]

export function concentrationToRgb(
  C: number,
  C0: number,
): [number, number, number] {
  const ratio = C0 > 0 ? Math.min(1, Math.max(0, C / C0)) : 0
  return [
    PALE_BLUE[0] + (PURPLE[0] - PALE_BLUE[0]) * ratio,
    PALE_BLUE[1] + (PURPLE[1] - PALE_BLUE[1]) * ratio,
    PALE_BLUE[2] + (PURPLE[2] - PALE_BLUE[2]) * ratio,
  ]
}

export function rgbToCss(rgb: [number, number, number], alpha = 1): string {
  const r = Math.round(rgb[0] * 255)
  const g = Math.round(rgb[1] * 255)
  const b = Math.round(rgb[2] * 255)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function formatMgL(C: number): string {
  return `${kgM3ToMgL(C).toFixed(2)} mg/L`
}
