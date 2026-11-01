<script lang="ts">
  import type { CursorKind, CursorStyle } from './types.js'

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
          <svg height="24" width="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <g transform="translate(10 7)">
              <path d="m6.148 18.473 1.863-1.003 1.615-.839-2.568-4.816h4.332l-11.379-11.408v16.015l3.316-3.221z" fill="#fff" />
              <path d="m6.431 17 1.765-.941-2.775-5.202h3.604l-8.025-8.043v11.188l2.53-2.442z" fill="#000" />
            </g>
          </svg>
        {:else if shown === 'ibeam'}
          <svg width="10" height="16" viewBox="0 0 10 16" fill="none" overflow="visible" aria-hidden="true">
            <path d="M3 1H7M3 15H7M5 1V15" style="stroke:var(--ss-cursor-edge,#fff)" stroke-width="2.6" stroke-linecap="round" />
            <path d="M3 1H7M3 15H7M5 1V15" style="stroke:var(--ss-cursor-line,#000)" stroke-width="1" stroke-linecap="round" />
          </svg>
        {:else if shown === 'hand' || shown === 'open' || shown === 'grab'}
          <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path
              d="M10.6 6a1.7 1.7 0 0 1 3.4 0v6.6a1.3 1.3 0 0 1 2.6 0v.7a1.3 1.3 0 0 1 2.6 0v.7a1.3 1.3 0 0 1 2.6 0V19c0 3.1-2 5.6-5 5.6h-2.6c-2 0-3.3-.9-4.4-2.4l-3.1-4.1c-.6-.9-.4-2 .5-2.5.8-.4 1.7-.2 2.3.5l1.1 1.4V6Z"
              fill="#fff" stroke="#000" stroke-width="1.1" stroke-linejoin="round"
            />
            <path d="M14 12.6v3.6M16.6 13.3v3M19.2 14v2.6" stroke="#000" stroke-width="1" stroke-linecap="round" />
          </svg>
        {:else if shown === 'wait'}
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="10" cy="10" r="8" stroke="rgba(0,0,0,0.15)" stroke-width="2" />
            <path d="M10 2A8 8 0 0 1 18 10" stroke="black" stroke-width="2" stroke-linecap="round" />
          </svg>
        {:else if shown === 'crosshair'}
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none" overflow="visible" aria-hidden="true">
            <path d="M8.5 0V17M0 8.5H17" style="stroke:var(--ss-cursor-edge,#fff)" stroke-width="2.6" />
            <path d="M8.5 0V17M0 8.5H17" style="stroke:var(--ss-cursor-line,#000)" stroke-width="1" />
          </svg>
        {:else}
          <svg width="21" height="21" viewBox="-14 -14 28 28" overflow="visible" aria-hidden="true">
            <g transform={`rotate(${turn})`} stroke-linejoin="round">
              <path d="M0-8.4 2.55-3.65H-2.55ZM0 8.4 2.55 3.65H-2.55Z" style="fill:var(--ss-cursor-edge,#fff);stroke:var(--ss-cursor-edge,#fff)" stroke-width="3.2" />
              <path d="M0-8.4 2.55-3.65H-2.55ZM0 8.4 2.55 3.65H-2.55Z" style="fill:var(--ss-cursor-line,#000);stroke:var(--ss-cursor-line,#000)" stroke-width="1.2" />
            </g>
          </svg>
        {/if}
      </div>
    {/if}
  </div>
</div>
