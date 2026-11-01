<script lang="ts">
  import type { CursorKind, CursorStyle } from './types.js'
  import MacCrosshair from './cursors/MacCrosshair.svelte'
  import MacGrab from './cursors/MacGrab.svelte'
  import MacIbeam from './cursors/MacIbeam.svelte'
  import MacOpenHand from './cursors/MacOpenHand.svelte'
  import MacPointingHand from './cursors/MacPointingHand.svelte'
  import MacPointer from './cursors/MacPointer.svelte'
  import MacResize from './cursors/MacResize.svelte'
  import MacWait from './cursors/MacWait.svelte'

  interface Props {
    x: number
    y: number
    kind?: CursorKind
    style?: CursorStyle
    pressed?: boolean
    idle?: boolean
    touching?: boolean
  }

  let { x, y, kind = 'pointer', style = 'real', pressed = false, idle = false, touching = false }: Props = $props()

  const HOTSPOT: Record<CursorKind, { x: number; y: number }> = {
    pointer: { x: 7.5, y: 5.25 },
    ibeam: { x: 5, y: 8 },
    crosshair: { x: 8.5, y: 8.5 },
    hand: { x: 9.75, y: 3.25 },
    open: { x: 11.7, y: 10.4 },
    grab: { x: 12, y: 12 },
    wait: { x: 8, y: 8 },
    'resize-ns': { x: 10.5, y: 10.5 },
    'resize-ew': { x: 10.5, y: 10.5 },
    'resize-nwse': { x: 10.5, y: 10.5 },
    'resize-nesw': { x: 10.5, y: 10.5 },
  }

  const arrow = $derived(style === 'arrow')
  const shown = $derived(arrow && kind !== 'ibeam' ? 'pointer' : kind)
  const hot = $derived(arrow && shown === 'pointer' ? { x: 4, y: 3 } : HOTSPOT[shown])
  const dot = $derived(style === 'circle' || style === 'touch')
  const turn = $derived(shown === 'resize-ns' ? 0 : shown === 'resize-ew' ? 90 : shown === 'resize-nwse' ? -45 : 45)
</script>

<div
  class="ss-cursor"
  data-style={style}
  data-kind={kind}
  data-pressed={pressed || undefined}
  data-idle={idle || undefined}
  data-touching={touching || undefined}
  style={`transform:translate(${x}px, ${y}px)`}
  aria-hidden="true"
>
  {#if style === 'touch'}<span class="ss-cursor__streak"></span>{/if}
  <div class="ss-cursor__press">
    {#if dot}<span class="ss-cursor__dot"></span>{/if}
    {#if !dot}
      <div
        class="ss-cursor__glyph"
        data-glyph={shown}
        data-active="true"
        style={`margin-left:${-hot.x}px;margin-top:${-hot.y}px;transform-origin:${hot.x}px ${hot.y}px`}
      >
        {#if arrow && shown === 'pointer'}
          <svg width="22" height="22" viewBox="0 0 22 22" class="ss-cursor__arrow" aria-hidden="true">
            <path d="M4 3 18.5 9.6 11.8 11.8 9.6 18.5Z" />
          </svg>
        {:else if shown === 'pointer'}
          <MacPointer />
        {:else if shown === 'ibeam'}
          <MacIbeam />
        {:else if shown === 'hand'}
          <MacPointingHand />
        {:else if shown === 'open'}
          <MacOpenHand />
        {:else if shown === 'grab'}
          <MacGrab />
        {:else if shown === 'wait'}
          <MacWait />
        {:else if shown === 'crosshair'}
          <MacCrosshair />
        {:else}
          <MacResize {turn} />
        {/if}
      </div>
    {/if}
  </div>
</div>
