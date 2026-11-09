import { WATER_20C } from './parameters'

/** Q = Cd · A_valv · √(2 g h)  (Torricelli / orificio). Unidades SI. */
export function torricelliFlow(
  Cd: number,
  valveArea: number,
  head: number,
): number {
  if (valveArea <= 0 || head <= 0) return 0
  return Cd * valveArea * Math.sqrt(2 * WATER_20C.g * head)
}

export function valveOpeningFromFlow(
  Q: number,
  Cd: number,
  maxArea: number,
  head: number,
): number {
  if (maxArea <= 0) return 0
  const qMax = torricelliFlow(Cd, maxArea, head)
  if (qMax <= 0) return 0
  return Math.min(1, Math.max(0, Q / qMax))
}
