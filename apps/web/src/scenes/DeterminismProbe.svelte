<script lang="ts">
  import HeroDemo from './HeroDemo.svelte'

  interface RunResult {
    frames: number
    same: boolean
    first: number
    a: string[]
    b: string[]
  }

  let hero: { runFrames: (count?: number) => Promise<string[]> } | undefined = $state()

  export async function run(count = 1500): Promise<RunResult> {
    if (!hero) throw new Error('HeroDemo is not mounted')
    await document.fonts.ready
    const a = await hero.runFrames(count)
    const b = await hero.runFrames(count)
    let first = -1
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      if (a[i] !== b[i]) {
        first = i
        break
      }
    }
    return { frames: a.length, same: first === -1, first, a, b }
  }
</script>

<HeroDemo bind:this={hero} deterministic />
