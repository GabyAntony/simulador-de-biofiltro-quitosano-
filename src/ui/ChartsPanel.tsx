import type { ReactNode } from 'react'
import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { kgM3ToMgL, m3sToMlMin, m3ToMl } from '../sim/units'
import { useSimStore } from '../state/useSimStore'

function Mini({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="chart-card">
      <h3>{title}</h3>
      <div className="chart-body">{children}</div>
    </div>
  )
}

export function ChartsPanel() {
  const history = useSimStore((s) => s.engine.history)
  const continuousFeed = useSimStore((s) => s.continuousFeed)
  const data = history.map((p) => ({
    t: p.t / 60,
    C: kgM3ToMgL(p.C),
    C0: kgM3ToMgL(p.C0),
    ratio: p.C0 > 0 ? p.C / p.C0 : 0,
    eta: p.eta,
    Q: m3sToMlMin(p.Q),
    V: m3ToMl(p.Veff),
  }))

  const axis = { fontSize: 10, tick: { fill: '#5b6570' } }
  const formatTick = (value: number | string) => Number(value).toFixed(0)

  return (
    <section className="charts">
      <Mini title="C (mg/L) frente al tiempo (min)">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="t"
              tickFormatter={formatTick}
              {...axis}
            />
            <YAxis padding={{ top: 4, bottom: 4 }} {...axis} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="C"
              stroke="#6b21a8"
              dot={false}
              strokeWidth={1.8}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Mini>

      <Mini title="Eficiencia η (%) frente al tiempo (min)">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="t"
              tickFormatter={formatTick}
              {...axis}
            />
            <YAxis
              domain={[0, 100]}
              padding={{ top: 4, bottom: 4 }}
              {...axis}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="eta"
              stroke="#0f766e"
              dot={false}
              strokeWidth={1.8}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Mini>

      <Mini title="Caudal (mL/min) frente al tiempo (min)">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="t"
              tickFormatter={formatTick}
              {...axis}
            />
            <YAxis padding={{ top: 4, bottom: 4 }} {...axis} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="Q"
              stroke="#1d4ed8"
              dot={false}
              strokeWidth={1.8}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Mini>

      <Mini
        title={`${continuousFeed ? 'Volumen alimentado' : 'Volumen tratado'} (mL) frente al tiempo (min)`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="t"
              tickFormatter={formatTick}
              {...axis}
            />
            <YAxis padding={{ top: 4, bottom: 4 }} {...axis} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="V"
              stroke="#b45309"
              dot={false}
              strokeWidth={1.8}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Mini>

      <Mini title="Curva de ruptura C/C₀ frente a V (mL)">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 4, right: 6, bottom: 0, left: -18 }}>
            <XAxis
              type="number"
              dataKey="V"
              name="V"
              unit=" mL"
              tickFormatter={formatTick}
              {...axis}
            />
            <YAxis
              type="number"
              dataKey="ratio"
              name="C/C₀"
              domain={[0, 1]}
              padding={{ top: 4, bottom: 4 }}
              {...axis}
            />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <ReferenceLine y={0.5} stroke="#9f1239" strokeDasharray="4 3" />
            <Scatter
              data={data}
              fill="#6b21a8"
              isAnimationActive={false}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </Mini>
    </section>
  )
}
