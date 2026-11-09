import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import {
  Color,
  InstancedMesh,
  Object3D,
  type InstancedBufferAttribute,
  type WebGLProgramParametersWithUniforms,
} from 'three'
import { localConcentration } from '../sim/adsorption'
import { concentrationToRgb } from '../sim/color'
import {
  columnTopY,
  GEO,
  layerBounds,
  packingFloorY,
  reservoirBottomY,
  reservoirTopY,
} from '../sim/geometry'
import { engineRef, useSimStore } from '../state/useSimStore'

const COUNT = 280
const dummy = new Object3D()
const color = new Color()

type Drop = {
  s: number
  r: number
  th: number
  size: number
  alpha: number
  alive: boolean
}

function randomAlpha(): number {
  return 0.55 + Math.random() * 0.38
}

function pathPoint(s: number, r: number, th: number, explode: number) {
  const xOff = r * Math.cos(th)
  const zOff = r * Math.sin(th) * 0.4
  if (s < 0.12) {
    const u = s / 0.12
    return {
      x: xOff * 0.6,
      y:
        reservoirTopY -
        0.01 +
        explode * 0.1 -
        u * (GEO.reservoir.height * 0.7),
      z: zOff,
    }
  }
  if (s < 0.28) {
    const u = (s - 0.12) / 0.16
    return {
      x: -0.02 - u * 0.06 + xOff * 0.15,
      y: reservoirBottomY + 0.01 + explode * 0.08 - u * 0.02,
      z: 0.02 + zOff,
    }
  }
  if (s < 0.4) {
    const u = (s - 0.28) / 0.12
    return {
      x: -0.08 * (1 - u) + xOff * 0.2,
      y: columnTopY + 0.01 + explode * 0.03 - u * 0.02,
      z: 0.02 * (1 - u),
    }
  }
  if (s < 0.82) {
    const u = (s - 0.4) / 0.42
    const y = columnTopY - 0.015 - u * (columnTopY - packingFloorY - 0.01)
    return {
      x: xOff * GEO.column.innerR * 0.55,
      y,
      z: zOff * GEO.column.innerR * 1.2,
    }
  }
  const u = (s - 0.82) / 0.18
  return {
    x: u * GEO.beaker.x + xOff * 0.1,
    y:
      packingFloorY -
      0.01 -
      u * (packingFloorY - GEO.beaker.bottomY - 0.04),
    z: GEO.beaker.z * u + zOff * 0.3,
  }
}

function pathY(s: number, explode: number) {
  return pathPoint(s, 0, 0, explode).y
}

/**
 * Añade un atributo de instancia `instanceAlpha` al material físico.
 * Three no tiene alpha por instancia en InstancedMesh, así que se parchea
 * el shader para multiplicar el alpha final por el valor de cada gota.
 */
function patchParticleMaterial(shader: WebGLProgramParametersWithUniforms) {
  shader.vertexShader = `attribute float instanceAlpha;\nvarying float vInstanceAlpha;\n${shader.vertexShader}`
  shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>',
    '#include <begin_vertex>\n  vInstanceAlpha = instanceAlpha;',
  )
  shader.fragmentShader = `varying float vInstanceAlpha;\n${shader.fragmentShader}`
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <dithering_fragment>',
    '#include <dithering_fragment>\n  gl_FragColor.a *= vInstanceAlpha;',
  )
}

export function ParticleField({ explode }: { explode: number }) {
  const mesh = useRef<InstancedMesh>(null)
  const drops = useRef<Drop[]>([])
  const spawnAcc = useRef(0)
  const resetEpoch = useSimStore((s) => s.resetEpoch)

  const alphaArray = useMemo(() => new Float32Array(COUNT), [])

  useEffect(() => {
    spawnAcc.current = 0
    for (const drop of drops.current) {
      drop.alive = false
      drop.s = 0
      drop.alpha = randomAlpha()
    }
  }, [resetEpoch])

  useFrame((_, dt) => {
    const meshObj = mesh.current
    if (!meshObj) return

    if (drops.current.length === 0) {
      const list: Drop[] = []
      for (let i = 0; i < COUNT; i += 1) {
        list.push({
          s: 0,
          r: Math.random(),
          th: Math.random() * Math.PI * 2,
          size: 0.7 + Math.random() * 0.7,
          alpha: randomAlpha(),
          alive: false,
        })
      }
      drops.current = list
    }

    const { running, C0, cutaway } = useSimStore.getState()
    const engine = engineRef.current
    const speed = Math.min(0.45, engine.vs * 18 + (engine.Q > 0 ? 0.04 : 0))
    const spawnRate = engine.Q > 1e-12 ? 40 + engine.vs * 800 : 0

    if (running && spawnRate > 0) {
      spawnAcc.current += spawnRate * dt
      while (spawnAcc.current >= 1) {
        spawnAcc.current -= 1
        const idle = drops.current.find((d) => !d.alive)
        if (idle) {
          idle.alive = true
          idle.s = Math.random() * 0.08
          idle.r = Math.random()
          idle.th = Math.random() * Math.PI * 2
          idle.alpha = randomAlpha()
        }
      }
    }

    const chi0 = layerBounds.chitosan.y0
    const chi1 = layerBounds.chitosan.y1
    const alphaAttribute = meshObj.geometry.getAttribute(
      'instanceAlpha',
    ) as InstancedBufferAttribute

    for (let i = 0; i < COUNT; i += 1) {
      const d = drops.current[i]
      if (d.alive && running) {
        d.s += speed * dt * (0.7 + d.size * 0.3)
        if (d.s >= 1) {
          d.alive = false
          d.s = 0
        }
      }
      if (!d.alive) {
        dummy.position.set(0, -2, 0)
        dummy.scale.setScalar(0)
        dummy.updateMatrix()
        meshObj.setMatrixAt(i, dummy.matrix)
        // oxlint-disable-next-line react/immutability -- buffer de instancia mutable de Three.js
        alphaArray[i] = 0
        continue
      }
      const p = pathPoint(d.s, d.r, d.th, explode)
      if (cutaway && p.z > 0.004) {
        dummy.position.set(0, -2, 0)
        dummy.scale.setScalar(0)
      } else {
        dummy.position.set(p.x, p.y, p.z)
        dummy.scale.setScalar(0.0018 * d.size)
      }
      dummy.updateMatrix()
      meshObj.setMatrixAt(i, dummy.matrix)
      const y = pathY(d.s, explode)
      const C = localConcentration(y, chi0, chi1, C0, engine.C)
      const rgb = concentrationToRgb(C, C0)
      color.setRGB(rgb[0], rgb[1], rgb[2])
      meshObj.setColorAt(i, color)
      alphaArray[i] = cutaway && p.z > 0.004 ? 0 : d.alpha
    }
    meshObj.instanceMatrix.needsUpdate = true
    if (meshObj.instanceColor) meshObj.instanceColor.needsUpdate = true
    // oxlint-disable-next-line react/immutability -- atributo GPU mutable de Three.js
    alphaAttribute.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, COUNT]}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 10, 8]}>
        <instancedBufferAttribute
          attach="attributes-instanceAlpha"
          args={[alphaArray, 1]}
        />
      </sphereGeometry>
      <meshPhysicalMaterial
        vertexColors
        transparent
        opacity={0.82}
        roughness={0.15}
        metalness={0}
        depthWrite={false}
        onBeforeCompile={patchParticleMaterial}
      />
    </instancedMesh>
  )
}
