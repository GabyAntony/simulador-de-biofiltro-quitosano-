import {
  AdaptiveDpr,
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
} from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { Vector3 } from 'three'
import { GEO } from '../sim/geometry'
import { BiofilterAssembly } from './BiofilterAssembly'
import { OverlayTicker } from './OverlayTicker'

const CAMERA_TARGET = new Vector3(0, 0.26, 0)
const CAMERA_DIRECTION = new Vector3(0.4, 0.1, 0.6).normalize()
const DESKTOP_DISTANCE = 0.728
const MOBILE_DISTANCE = 1

function CameraFraming() {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls) as unknown as {
    target: Vector3
    update: () => void
  } | null

  useEffect(() => {
    const query = window.matchMedia('(max-width: 900px)')
    const apply = () => {
      const distance = query.matches ? MOBILE_DISTANCE : DESKTOP_DISTANCE
      camera.position
        .copy(CAMERA_TARGET)
        .addScaledVector(CAMERA_DIRECTION, distance)
      camera.lookAt(CAMERA_TARGET)
      if (controls) {
        controls.target.copy(CAMERA_TARGET)
        controls.update()
      }
    }

    apply()
    query.addEventListener('change', apply)
    return () => query.removeEventListener('change', apply)
  }, [camera, controls])

  return null
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#f4f7fb', '#c5cdd6', 0.45]} />
      <directionalLight
        position={[0.6, 0.9, 0.5]}
        intensity={1.35}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.05}
        shadow-camera-far={2}
        shadow-camera-left={-0.4}
        shadow-camera-right={0.4}
        shadow-camera-top={0.5}
        shadow-camera-bottom={-0.2}
      />
      <directionalLight position={[-0.4, 0.3, -0.3]} intensity={0.25} />
    </>
  )
}

function Table() {
  return (
    <mesh
      position={[0.04, -GEO.tableThickness / 2, 0]}
      receiveShadow
      castShadow
    >
      <boxGeometry args={[GEO.tableSize, GEO.tableThickness, GEO.tableSize]} />
      <meshStandardMaterial color="#e7ecf1" roughness={0.72} metalness={0.04} />
    </mesh>
  )
}

export function LabCanvas() {
  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.75]}
      gl={{ antialias: true, localClippingEnabled: true, alpha: false }}
      camera={{ position: [0.4, 0.36, 0.6], fov: 42, near: 0.01, far: 8 }}
      onCreated={({ gl, camera }) => {
        gl.setClearColor('#e8eef5')
        camera.lookAt(0, 0.26, 0)
      }}
    >
      <AdaptiveDpr pixelated={false} />
      <CameraFraming />
      <Lights />
      <Environment resolution={128}>
        <Lightformer
          form="rect"
          intensity={1.8}
          position={[0, 0.65, -0.45]}
          scale={[1.2, 0.5, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.1}
          position={[-0.6, 0.4, 0.5]}
          rotation={[0, Math.PI / 4, 0]}
          scale={[0.8, 0.8, 1]}
        />
        <Lightformer
          form="ring"
          intensity={0.8}
          position={[0.5, 0.5, 0.4]}
          scale={0.5}
        />
      </Environment>
      <Table />
      <BiofilterAssembly />
      <ContactShadows
        position={[0, 0.002, 0]}
        opacity={0.28}
        scale={0.9}
        blur={2.2}
        far={0.6}
      />
      <OrbitControls
        makeDefault
        target={[0, 0.26, 0]}
        minDistance={0.18}
        maxDistance={1.4}
        maxPolarAngle={Math.PI * 0.9}
        enablePan
      />
      {/* Al final: tras actualizar la cámara de OrbitControls. */}
      <OverlayTicker />
    </Canvas>
  )
}
