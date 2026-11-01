<script lang="ts">
  import DeterminismProbe from './DeterminismProbe.svelte'

  interface Result {
    frames: number
    same: boolean
    first: number
    a: string[]
    b: string[]
  }

  let probe: { run: (count?: number) => Promise<Result> } | undefined = $state()

  $effect(() => {
    ;(window as unknown as { __runDeterminism?: (count?: number) => Promise<Result> }).__runDeterminism = async (count) => {
      while (!probe) await new Promise((resolve) => setTimeout(resolve, 20))
      return probe.run(count)
    }

  })
</script>

<DeterminismProbe bind:this={probe} />
