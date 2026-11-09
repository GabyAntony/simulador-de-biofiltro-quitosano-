import { useState } from 'react'
import { useSimulationLoop } from './hooks/useSimulationLoop'
import { LabCanvas } from './scene/LabCanvas'
import { ChartsPanel } from './ui/ChartsPanel'
import { ControlPanel } from './ui/ControlPanel'
import { MobileReadouts } from './ui/MobileReadouts'
import { SceneOverlays } from './ui/SceneOverlays'

export default function App() {
  useSimulationLoop()
  const [dockOpen, setDockOpen] = useState(false)

  return (
    <div className={`app${dockOpen ? ' dock-open' : ''}`}>
      <div className="stage">
        <LabCanvas />
        <SceneOverlays />
        <MobileReadouts />
        <p className="orbit-hint">
          Arrastra para orbitar · rueda para acercar · arrastra la sonda para
          medir
        </p>
      </div>
      <div className="dock" id="controls-dock">
        <ControlPanel />
        <ChartsPanel />
      </div>
      <button
        type="button"
        className="dock-toggle"
        aria-expanded={dockOpen}
        aria-controls="controls-dock"
        onClick={() => setDockOpen((open) => !open)}
      >
        {dockOpen ? 'Ocultar controles' : 'Mostrar controles'}
      </button>
    </div>
  )
}
