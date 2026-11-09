import { Object3D, type InstancedMesh } from 'three'

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type PackItem = {
  x: number
  y: number
  z: number
  rx: number
  ry: number
  rz: number
  s: number
}

export function packCylinder(
  y0: number,
  y1: number,
  radius: number,
  count: number,
  seed: number,
  scaleJitter = 0.15,
): PackItem[] {
  const rand = mulberry32(seed)
  const items: PackItem[] = []
  let guard = 0
  while (items.length < count && guard < count * 20) {
    guard += 1
    const rr = Math.sqrt(rand()) * radius * 0.92
    const th = rand() * Math.PI * 2
    const x = rr * Math.cos(th)
    const z = rr * Math.sin(th)
    const y = y0 + rand() * (y1 - y0)
    items.push({
      x,
      y,
      z,
      rx: rand() * Math.PI,
      ry: rand() * Math.PI,
      rz: rand() * Math.PI,
      s: 1 + (rand() - 0.5) * 2 * scaleJitter,
    })
  }
  return items
}

/**
 * Empaquetado del lecho de quitosano: rejilla hexagonal con jitter.
 * La separación depende de dp y ε para que el lecho se vea denso y
 * cambie al mover los sliders. Se limita el número de instancias para
 * mantener el rendimiento; si la rejilla es muy grande se submuestrea
 * de forma uniforme.
 */
export function packChitosanBed(
  y0: number,
  y1: number,
  radius: number,
  dp: number,
  porosity: number,
  maxCount = 4200,
): PackItem[] {
  const baseSpacing = dp * (0.9 + porosity * 0.45)
  const baseDy = dp * (0.75 + porosity * 0.35)
  const height = Math.max(dp, y1 - y0)
  const volume = Math.PI * radius * radius * height
  const estimate = volume / (baseSpacing * baseSpacing * baseDy)

  // Si la rejilla realista supera el presupuesto de instancias, se engrosa
  // la separación y se agrandan las esferas en la misma proporción. Así el
  // lecho sigue viéndose continuo en vez de quedar sembrado de huecos.
  let factor = estimate > maxCount ? Math.cbrt(estimate / maxCount) : 1
  let items: PackItem[] = []

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const rand = mulberry32(47)
    const spacing = baseSpacing * factor
    const dy = baseDy * factor
    const margin = (dp * factor) / 2
    const all: PackItem[] = []

    let row = 0
    for (let y = y0 + margin; y <= y1 - margin; y += dy, row += 1) {
      const offset = (row % 2) * spacing * 0.5
      for (let x = -radius; x <= radius; x += spacing) {
        for (let z = -radius; z <= radius; z += spacing) {
          const jx = x + offset + (rand() - 0.5) * spacing * 0.18
          const jz = z + (rand() - 0.5) * spacing * 0.18
          if (Math.hypot(jx, jz) > radius - margin) continue
          all.push({
            x: jx,
            y: y + (rand() - 0.5) * dy * 0.16,
            z: jz,
            rx: rand() * Math.PI,
            ry: rand() * Math.PI,
            rz: rand() * Math.PI,
            s: factor * (1 + (rand() - 0.5) * 2 * 0.08),
          })
        }
      }
    }

    items = all
    if (items.length <= maxCount) break
    factor *= Math.cbrt(items.length / maxCount) * 1.02
  }

  if (items.length === 0) {
    return [
      {
        x: 0,
        y: (y0 + y1) / 2,
        z: 0,
        rx: 0,
        ry: 0,
        rz: 0,
        s: 1,
      },
    ]
  }

  if (items.length > maxCount) {
    const stride = Math.ceil(items.length / maxCount)
    return items.filter((_, index) => index % stride === 0).slice(0, maxCount)
  }

  return items
}

const dummy = new Object3D()

export function writeInstances(
  mesh: InstancedMesh | null,
  items: PackItem[],
  explodeDy: number,
  hideFront: boolean,
  uniformScale = 1,
): void {
  if (!mesh) return
  let visible = 0
  for (const item of items) {
    if (hideFront && item.z > 0.001) continue
    dummy.position.set(item.x, item.y + explodeDy, item.z)
    dummy.rotation.set(item.rx, item.ry, item.rz)
    dummy.scale.setScalar(item.s * uniformScale)
    dummy.updateMatrix()
    mesh.setMatrixAt(visible, dummy.matrix)
    visible += 1
  }
  dummy.scale.setScalar(0)
  dummy.position.set(0, -10, 0)
  dummy.updateMatrix()
  for (let i = visible; i < items.length; i += 1) {
    mesh.setMatrixAt(i, dummy.matrix)
  }
  mesh.count = items.length
  mesh.instanceMatrix.needsUpdate = true
}
