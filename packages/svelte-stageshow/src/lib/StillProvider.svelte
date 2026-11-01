<script lang="ts">
  import type { Snippet } from 'svelte'
  import { untrack } from 'svelte'
  import { setStill } from './still.js'

  interface Props {
    still: boolean
    children: Snippet
  }

  let { still, children }: Props = $props()
  setStill(untrack(() => still))
</script>

{@render children()}
