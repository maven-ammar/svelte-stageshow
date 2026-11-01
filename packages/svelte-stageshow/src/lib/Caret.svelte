<script lang="ts">
  interface Props {
    /** While typing, a real terminal holds the cursor solid. */
    still?: boolean
  }

  let { still = false }: Props = $props()
</script>

<span class="ss-term__caret" data-still={still || undefined} aria-hidden="true"></span>
