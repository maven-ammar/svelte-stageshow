<script lang="ts">
  interface Props {
    turn: number
  }

  let { turn }: Props = $props()
  const RESIZE_TIP = 'M0-8.4 2.55-3.65H-2.55ZM0 8.4 2.55 3.65H-2.55Z'
</script>

<svg width="21" height="21" viewBox="-14 -14 28 28" overflow="visible" aria-hidden="true">
  <g transform={`rotate(${turn})`} stroke-linejoin="round">
    <path
      d={RESIZE_TIP}
      style="fill:var(--ss-cursor-edge,#fff);stroke:var(--ss-cursor-edge,#fff)"
      stroke-width="3.2"
    />
    <path
      d={RESIZE_TIP}
      style="fill:var(--ss-cursor-line,#000);stroke:var(--ss-cursor-line,#000)"
      stroke-width="1.2"
    />
  </g>
</svg>
