<script lang="ts">
  import type { Keys, KeysAt } from './keys.js'

  interface Props {
    rows: (Keys | null)[]
    at: KeysAt
  }

  let { rows, at }: Props = $props()
</script>

{#each rows as row (row?.id)}
  {#if row}
    <div class="ss-keys" data-show={row.show} data-at={at} aria-hidden="true">
      {#each row.caps as c, i (i)}
        <kbd class="ss-key" data-down={row.down}>{c}</kbd>
      {/each}
    </div>
  {/if}
{/each}
