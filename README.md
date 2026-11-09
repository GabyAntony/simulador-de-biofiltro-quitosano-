# Simulador 3D de biofiltro de quitosano

Simulador interactivo de un biofiltro de lecho fijo de quitosano para la
remoción de violeta de cristal (CV, C.I. 42555). Combina un motor de simulación
en unidades SI con una escena 3D de laboratorio y gráficos de la operación.

> **Alcance:** herramienta educativa y de visualización. Los parámetros
> científicos provienen de literatura publicada y están etiquetados como
> referencias bibliográficas. No son resultados experimentales de este
> simulador ni sustituyen un diseño de ingeniería o una validación de
> laboratorio.

## Inicio rápido

Requiere Node.js 20.19 o superior (o 22.12+).

```bash
npm install
npm run dev
```

Abre la URL que muestra Vite (por defecto `http://localhost:5173`).

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con HMR. |
| `npm run build` | Chequeo de TypeScript y build de producción. |
| `npm run preview` | Sirve el build de producción. |
| `npm run lint` | Análisis estático con Oxlint. |
| `npm run verify` | Comprobaciones numéricas del motor sin navegador. |
| `npm run check` | Ejecuta lint, verificación del motor y build. |

La verificación también se ejecuta automáticamente al arrancar en modo
desarrollo y reporta el resultado en la consola del navegador.

## Modelo físico

El motor (`src/sim/`) es independiente de React y de Three.js. Trabaja
internamente en SI y la interfaz muestra mL/min, mg/L, g, mm y Pa.

1. **Hidráulica de entrada — Torricelli / orificio**

   `Q = Cd · A_válvula · √(2 g h)`

   `Cd = 0.61` es un valor típico de ingeniería para un orificio de bordes
   vivos; no está calibrado en este simulador.

2. **Pérdida de carga — Ergun**

   `ΔP/L = 150 μ (1−ε)² / (Φs² dp² ε³) · vs + 1.75 ρ (1−ε) / (Φs dp ε³) · vs²`

   Si el ΔP del lecho supera la carga hidráulica disponible (`ρ g h`), el
   caudal se limita por permeabilidad y la interfaz muestra un aviso.

3. **Adsorción — Thomas**

   `C/C₀ = 1 / [1 + exp(kTh (qm M − C₀ Veff) / Q)]`

   La concentración de salida se calcula con el volumen tratado acumulado y el
   caudal real. El historial de gráficos está acotado para mantener el
   rendimiento.

4. **Perfil visual de concentración**

   La columna de agua usa colores por vértice con una transición logística
   normalizada a través del lecho de quitosano: morado para el influente y azul
   claro para el efluente tratado.

### Modos de alimentación

- **Continuo (por defecto):** el reservorio se mantiene lleno, como si una
  bomba lo recargara desde un tanque mayor, y el efluente va a desagüe. El
  caudal es estable y la curva de ruptura se alcanza en decenas de segundos
  reales con la escala de tiempo por defecto. El vaso de salida muestra un
  nivel estable.
- **Finito:** se usan los 250 mL del reservorio visible. Con la escala de
  tiempo alta el vaciado es casi instantáneo; baja la escala para observarlo.
  El vaso acumula el efluente y puede desbordarse.

## Parámetros y procedencia

| Parámetro | Valor | Fuente |
| --- | --- | --- |
| `qm` | 169.49 mg/g | Vithalkar y Jugade (2020), Langmuir por lotes de CV sobre quitosano–bentonita reticulado, *Materials Today: Proceedings* 29, 1025–1032. |
| `kTh` | 1.6 × 10⁻⁴ L mg⁻¹ min⁻¹ | Bharathi y Ramesh (2013), columna de lecho fijo con CV, *Applied Water Science*. Condiciones reportadas: 10 mL/min y 10 cm de lecho. |
| Agua | 20 °C, μ = 1.002 × 10⁻³ Pa·s, ρ = 998.2 kg/m³ | Valores tabulados estándar. |
| `Cd` | 0.61 | Orificio de bordes vivos, valor típico de ingeniería. |

**Procedencia compuesta:** no se encontró un único estudio abierto de lecho
empacado CV/quitosano que reporte simultáneamente `qm` y `kTh`. Por
transparencia, el simulador usa `qm` de un ensayo por lotes y `kTh` de una
columna de CV. Ambos son valores de referencia; el resultado no debe
interpretarse como una predicción experimental validada.

## Escena 3D

- **Escala:** 1 unidad de escena = 1 metro. La columna mide 26 cm y se apoya en
  un soporte de laboratorio.
- **Rendimiento:** `InstancedMesh` para las capas del lecho, límite de 4200
  instancias para el quitosano, `AdaptiveDpr`, una luz direccional con sombras
  y `ContactShadows`.
- **Interacción:** órbita con arrastre, zoom con rueda, sonda de concentración
  arrastrable, vista de corte, despiece, vectores de flujo y mediciones.
- **Instrumentación:** manómetro 3D de ΔP con escala expandida de 0–3 Pa y
  tarjetas de caudal, eficiencia, tiempo, volumen tratado, concentración de
  salida y ΔP.
- **Móvil:** el panel de controles y gráficos se abre como un cajón inferior
  colapsable. Las lecturas aparecen en una cuadrícula compacta en la parte
  superior (sustituyen a las tarjetas ancladas a la escena) y la cámara se
  aleja para que quepa el equipo completo.

## Estructura

```
src/
  sim/        Motor independiente: geometría, unidades, hidrodinámica,
              adsorción, parámetros, verificación.
  state/      Estado Zustand y referencia mutable al motor.
  hooks/      Bucle de simulación con requestAnimationFrame.
  scene/      Escena React Three Fiber; solo lee estado.
  ui/         Panel de control y gráficos Recharts.
scripts/
  verify.mjs  Verificación del motor mediante Vite SSR.
```

## Limitaciones

- Modelo isotérmico a 20 °C, sin dispersión axial, pH, desorción ni
  crecimiento de biopelícula.
- Geometría y configuración del equipo fijas; no es un optimizador de diseño.
- La escena 3D es ilustrativa. Para respetar el presupuesto de 4200
  instancias, las esferas del lecho pueden dibujarse más grandes que el
  diámetro seleccionado; no deben usarse para medir tamaño de partícula.
- En pantallas estrechas las tarjetas 3D se sustituyen por la cuadrícula de
  lecturas superior; la sonda y su etiqueta permanecen y la medición puntual
  sigue disponible arrastrándola.
- Thomas es una idealización de lecho fijo; la procedencia compuesta de `qm` y
  `kTh` limita la interpretación cuantitativa.
- El desbordamiento del vaso de salida solo aplica al modo finito. Con 250 mL
  de reservorio y un vaso de ~530 mL no se alcanza en una sola carga; la
  alimentación continua evita el problema al enviar el efluente a desagüe.
- Un volumen de 250 mL equivale aproximadamente a un volumen de lecho. La
  ruptura de Thomas requiere del orden de 122 L con los valores por defecto,
  por eso el modo continuo es el adecuado para visualizarla.
# simulador-de-biofiltro-quitosano-
# simulador-de-biofiltro-quitosano-
