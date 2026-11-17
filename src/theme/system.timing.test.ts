import { createAppSystem } from './system'

// Opt-in: `TIME_APP_SYSTEM=1 npx vitest run --dir src src/theme/system.timing.test.ts --silent=false`. Skipped in
// `pnpm test`, where a loaded machine would make any timing meaningless.
const RUNS = 30
const describeWhenAsked = process.env.TIME_APP_SYSTEM ? describe : describe.skip

describeWhenAsked('createAppSystem timing (F9 budget)', () => {
  it('reports what one branded system costs to build', () => {
    createAppSystem('#123456') // warm the module graph and the JIT
    const times: number[] = []
    for (let i = 0; i < RUNS; i++) {
      const color = `#${(0x200000 + i * 0x050403).toString(16).slice(-6)}`
      const start = performance.now()
      createAppSystem(color)
      times.push(performance.now() - start)
    }
    times.sort((a, b) => a - b)
    const median = times[Math.floor(RUNS / 2)]
    const p90 = times[Math.floor(RUNS * 0.9)]
    console.info(`createAppSystem: median ${median.toFixed(1)} ms, p90 ${p90.toFixed(1)} ms over ${RUNS} colours`)
    expect(median).toBeLessThan(50)
  })
})
