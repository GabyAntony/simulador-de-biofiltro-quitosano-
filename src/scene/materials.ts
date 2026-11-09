import { DoubleSide, type Plane } from 'three'

export const PET = {
  color: '#c5d4de',
  roughness: 0.18,
  metalness: 0.05,
  transmission: 0.72,
  thickness: 0.004,
  ior: 1.46,
  transparent: true,
  opacity: 0.55,
  side: DoubleSide,
  depthWrite: false,
} as const

export const GLASS = {
  color: '#dfeaf1',
  roughness: 0.08,
  metalness: 0.0,
  transmission: 0.85,
  thickness: 0.006,
  ior: 1.5,
  transparent: true,
  opacity: 0.4,
  side: DoubleSide,
  depthWrite: false,
} as const

export const CHITOSAN_COLOR = '#e6d3ae'
export const CARBON_COLOR = '#1a1a1c'
export const COTTON_COLOR = '#f4f1ea'

export function clipProps(planes: Plane[] | null, clipped: boolean) {
  return clipped && planes
    ? { clippingPlanes: planes, clipShadows: true }
    : {}
}
