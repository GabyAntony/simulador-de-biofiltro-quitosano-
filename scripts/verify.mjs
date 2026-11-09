import { createServer } from 'vite'

const server = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true },
})

try {
  const mod = await server.ssrLoadModule('/src/sim/verify.ts')
  const result = mod.runEngineChecks()
  console.log(JSON.stringify(result, null, 2))
  console.log('engine checks ok')
} finally {
  await server.close()
}
