<script module lang="ts">
  type IconNode = readonly [tag: string, attrs: Record<string, string | number>]

  // Glyphs come from lucide, one family at one construction, so a row of icons
  // shares a weight. Two card-specific drawings (a chip, contactless arcs) stay
  // hand-drawn because no set has them. The nodes are inlined here so the port
  // has no lucide runtime.
  const LUCIDE = {
    check: [['path', { d: 'M20 6 9 17l-5-5' }]],
    plus: [
      ['path', { d: 'M5 12h14' }],
      ['path', { d: 'M12 5v14' }],
    ],
    close: [
      ['path', { d: 'M18 6 6 18' }],
      ['path', { d: 'm6 6 12 12' }],
    ],
    'chevron-right': [['path', { d: 'm9 18 6-6-6-6' }]],
    'chevron-down': [['path', { d: 'm6 9 6 6 6-6' }]],
    search: [
      ['circle', { cx: 11, cy: 11, r: 8 }],
      ['path', { d: 'm21 21-4.3-4.3' }],
    ],
    globe: [
      ['circle', { cx: 12, cy: 12, r: 10 }],
      ['path', { d: 'M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20' }],
      ['path', { d: 'M2 12h20' }],
    ],
    external: [
      ['path', { d: 'M7 7h10v10' }],
      ['path', { d: 'M7 17 17 7' }],
    ],
    clock: [
      ['circle', { cx: 12, cy: 12, r: 10 }],
      ['polyline', { points: '12 6 12 12 16 14' }],
    ],
    archive: [
      ['rect', { width: 20, height: 5, x: 2, y: 3, rx: 1 }],
      ['path', { d: 'M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8' }],
      ['path', { d: 'M10 12h4' }],
    ],
    trash: [
      ['path', { d: 'M3 6h18' }],
      ['path', { d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' }],
      ['path', { d: 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' }],
      ['line', { x1: 10, x2: 10, y1: 11, y2: 17 }],
      ['line', { x1: 14, x2: 14, y1: 11, y2: 17 }],
    ],
    more: [
      ['circle', { cx: 12, cy: 12, r: 1 }],
      ['circle', { cx: 19, cy: 12, r: 1 }],
      ['circle', { cx: 5, cy: 12, r: 1 }],
    ],
    arrow: [
      ['path', { d: 'M5 12h14' }],
      ['path', { d: 'm12 5 7 7-7 7' }],
    ],
    file: [
      ['path', { d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z' }],
      ['path', { d: 'M14 2v4a2 2 0 0 0 2 2h4' }],
    ],
    user: [
      ['path', { d: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' }],
      ['circle', { cx: 12, cy: 7, r: 4 }],
    ],
    bell: [
      ['path', { d: 'M10.268 21a2 2 0 0 0 3.464 0' }],
      ['path', { d: 'M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326' }],
    ],
    card: [
      ['rect', { width: 20, height: 14, x: 2, y: 5, rx: 2 }],
      ['line', { x1: 2, x2: 22, y1: 10, y2: 10 }],
    ],
    bolt: [['path', { d: 'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z' }]],
    lock: [
      ['rect', { width: 18, height: 11, x: 3, y: 11, rx: 2, ry: 2 }],
      ['path', { d: 'M7 11V7a5 5 0 0 1 10 0v4' }],
    ],
    play: [['polygon', { points: '6 3 20 12 6 21 6 3' }]],
    pause: [
      ['rect', { x: 14, y: 4, width: 4, height: 16, rx: 1 }],
      ['rect', { x: 6, y: 4, width: 4, height: 16, rx: 1 }],
    ],
    faceid: [
      ['path', { d: 'M3 7V5a2 2 0 0 1 2-2h2' }],
      ['path', { d: 'M17 3h2a2 2 0 0 1 2 2v2' }],
      ['path', { d: 'M21 17v2a2 2 0 0 1-2 2h-2' }],
      ['path', { d: 'M7 21H5a2 2 0 0 1-2-2v-2' }],
      ['path', { d: 'M8 14s1.5 2 4 2 4-2 4-2' }],
      ['path', { d: 'M9 9h.01' }],
      ['path', { d: 'M15 9h.01' }],
    ],
    wifi: [
      ['path', { d: 'M12 20h.01' }],
      ['path', { d: 'M2 8.82a15 15 0 0 1 20 0' }],
      ['path', { d: 'M5 12.859a10 10 0 0 1 14 0' }],
      ['path', { d: 'M8.5 16.429a5 5 0 0 1 7 0' }],
    ],
    heart: [['path', { d: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z' }]],
    star: [['path', { d: 'M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z' }]],
    calendar: [
      ['path', { d: 'M8 2v4' }],
      ['path', { d: 'M16 2v4' }],
      ['rect', { width: 18, height: 18, x: 3, y: 4, rx: 2 }],
      ['path', { d: 'M3 10h18' }],
    ],
    mail: [
      ['rect', { width: 20, height: 16, x: 2, y: 4, rx: 2 }],
      ['path', { d: 'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7' }],
    ],
    send: [
      ['path', { d: 'M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z' }],
      ['path', { d: 'm21.854 2.147-10.94 10.939' }],
    ],
    home: [
      ['path', { d: 'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8' }],
      ['path', { d: 'M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }],
    ],
    gear: [
      ['path', { d: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z' }],
      ['circle', { cx: 12, cy: 12, r: 3 }],
    ],
    grip: [
      ['circle', { cx: 9, cy: 12, r: 1 }],
      ['circle', { cx: 9, cy: 5, r: 1 }],
      ['circle', { cx: 9, cy: 19, r: 1 }],
      ['circle', { cx: 15, cy: 12, r: 1 }],
      ['circle', { cx: 15, cy: 5, r: 1 }],
      ['circle', { cx: 15, cy: 19, r: 1 }],
    ],
  } as const satisfies Record<string, readonly IconNode[]>

  const DRAWN = {
    chip: 'M3.5 2.5h9a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12V4a1.5 1.5 0 0 1 1.5-1.5zM2 6h4M2 10h4M10 6h4M10 10h4M6 2.5v11M10 2.5v11M6 8h4',
    contactless: 'M6.8 6.2a2.5 2.5 0 0 1 0 3.6M8.5 4.5a5 5 0 0 1 0 7M10.3 2.7a7.5 7.5 0 0 1 0 10.6',
  } as const

  type LucideName = keyof typeof LUCIDE
  export type IconName = LucideName | keyof typeof DRAWN

  // Solid versions, for small marks and tinted tiles where a thin outline goes
  // wiry. Cut-outs use the even-odd rule.
  const FILLED: Partial<Record<IconName, string>> = {
    bolt: 'M9.6 1.2 3.2 8.9a.6.6 0 0 0 .5 1H7.4l-1 4.9a.4.4 0 0 0 .7.3l6.4-7.7a.6.6 0 0 0-.5-1H9.3l1-4.9a.4.4 0 0 0-.7-.3Z',
    card: 'M3 3h10a1.75 1.75 0 0 1 1.75 1.75V5.6H1.25v-.85A1.75 1.75 0 0 1 3 3Zm-1.75 4.4h13.5v3.85A1.75 1.75 0 0 1 13 13H3a1.75 1.75 0 0 1-1.75-1.75Zm2.25 2.6v1h3v-1Z',
    bell: 'M8 1.25a4.25 4.25 0 0 0-4.25 4.25v3.1l-1.3 2.1a.6.6 0 0 0 .5.9h10.1a.6.6 0 0 0 .5-.9l-1.3-2.1V5.5A4.25 4.25 0 0 0 8 1.25ZM6.2 13.1a1.9 1.9 0 0 0 3.6 0Z',
    user: 'M8 1.5a3.1 3.1 0 1 1 0 6.2 3.1 3.1 0 0 1 0-6.2Zm0 7.4c3.1 0 5.4 1.8 5.9 4.6a.7.7 0 0 1-.7.8H2.8a.7.7 0 0 1-.7-.8C2.6 10.7 4.9 8.9 8 8.9Z',
    clock: 'M8 1.25a6.75 6.75 0 1 1 0 13.5 6.75 6.75 0 0 1 0-13.5Zm-.75 3v4.2l2.9 1.75.75-1.25-2.15-1.3V4.25Z',
    check: 'M8 1.25a6.75 6.75 0 1 1 0 13.5 6.75 6.75 0 0 1 0-13.5Zm3 4.3-.95-.8-3.3 3.95-1.85-1.8-.85.9 2.8 2.75Z',
    // SF Symbols-style solids for Apple-native demos
    lock: 'M8 1.25A3.25 3.25 0 0 0 4.75 4.5v2H4.5A1.5 1.5 0 0 0 3 8v5.25a1.5 1.5 0 0 0 1.5 1.5h7a1.5 1.5 0 0 0 1.5-1.5V8a1.5 1.5 0 0 0-1.5-1.5h-.25v-2A3.25 3.25 0 0 0 8 1.25Zm-1.75 5.25v-2a1.75 1.75 0 0 1 3.5 0v2Z',
    play: 'M4.5 2.6v10.8a.8.8 0 0 0 1.2.7l8.6-5.4a.8.8 0 0 0 0-1.4L5.7 1.9a.8.8 0 0 0-1.2.7Z',
    pause: 'M4 2.5h2.6a.6.6 0 0 1 .6.6v9.8a.6.6 0 0 1-.6.6H4a.6.6 0 0 1-.6-.6V3.1a.6.6 0 0 1 .6-.6Zm5.4 0H12a.6.6 0 0 1 .6.6v9.8a.6.6 0 0 1-.6.6H9.4a.6.6 0 0 1-.6-.6V3.1a.6.6 0 0 1 .6-.6Z',
    heart: 'M8 14.2c-.2 0-6.6-3.7-6.6-8.4a3.6 3.6 0 0 1 6.6-2 3.6 3.6 0 0 1 6.6 2c0 4.7-6.4 8.4-6.6 8.4Z',
    star: 'M8 1.2a.6.6 0 0 1 .55.35l1.75 3.6 3.95.55a.6.6 0 0 1 .33 1.03l-2.86 2.8.68 3.94a.6.6 0 0 1-.87.63L8 12.25 4.47 14.1a.6.6 0 0 1-.87-.63l.68-3.94-2.86-2.8a.6.6 0 0 1 .33-1.03l3.95-.55 1.75-3.6A.6.6 0 0 1 8 1.2Z',
    home: 'M7.5 1.6a.8.8 0 0 1 1 0l5.7 4.6a.8.8 0 0 1 .3.6v6.7a1 1 0 0 1-1 1H10V10.3H6v4.2H2.5a1 1 0 0 1-1-1V6.8a.8.8 0 0 1 .3-.6Z',
    gear: 'M6.67 2.46L7.03 0.81L8.97 0.81L9.33 2.46L10.98 3.14L12.40 2.24L13.76 3.60L12.86 5.02L13.54 6.67L15.19 7.03L15.19 8.97L13.54 9.33L12.86 10.98L13.76 12.40L12.40 13.76L10.98 12.86L9.33 13.54L8.97 15.19L7.03 15.19L6.67 13.54L5.02 12.86L3.60 13.76L2.24 12.40L3.14 10.98L2.46 9.33L0.81 8.97L0.81 7.03L2.46 6.67L3.14 5.02L2.24 3.60L3.60 2.24L5.02 3.14ZM5.60 8.00a2.40 2.40 0 1 0 4.80 0a2.40 2.40 0 1 0 -4.80 0Z',
    calendar: 'M3.5 2h9A2 2 0 0 1 14.5 4v8.5a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm-.5 4.5v6a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-6ZM4.2 7.6h1.6v1.6h-1.6ZM7.2 7.6h1.6v1.6h-1.6ZM10.2 7.6h1.6v1.6h-1.6ZM4.2 10.2h1.6v1.6h-1.6ZM7.2 10.2h1.6v1.6h-1.6ZM10.2 10.2h1.6v1.6h-1.6Z',
    send: 'M14.3 1.7a.55.55 0 0 0-.6-.12L1.75 6.4a.55.55 0 0 0 0 1.02l4.6 1.85 4.9-4.13a.2.2 0 0 1 .28.28L7.4 10.3l1.84 4.6a.55.55 0 0 0 1.02 0l4.83-11.95a.55.55 0 0 0-.12-.6Z',
    mail: 'M2.5 3h11A1.5 1.5 0 0 1 15 4.4L8 8.9 1 4.4A1.5 1.5 0 0 1 2.5 3ZM1 6.1v5.4A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.1l-6.6 4.2a.8.8 0 0 1-.8 0Z',
  }
</script>

<script lang="ts">
  import type { SVGAttributes } from 'svelte/elements'

  interface Props extends Omit<SVGAttributes<SVGSVGElement>, 'class' | 'stroke' | 'children'> {
    name: IconName
    size?: number
    stroke?: number
    filled?: boolean
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
  }

  let { name, size = 16, stroke = 1.5, filled, className = '', class: klass = '', style = '', ...rest }: Props = $props()

  const solid = $derived(filled ? FILLED[name] : undefined)
  const glyph = $derived((LUCIDE as Record<string, readonly IconNode[] | undefined>)[name])
  const drawn = $derived((DRAWN as Record<string, string | undefined>)[name])
  const cls = $derived(`ss-icon${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`)
</script>

{#if solid}
  <svg {...rest} viewBox="0 0 16 16" width={size} height={size} class={cls} style={style || undefined} aria-hidden="true">
    <path d={solid} fill="currentColor" fill-rule="evenodd" />
  </svg>
{:else if glyph}
  <svg
    {...rest}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width={stroke * (24 / size)}
    stroke-linecap="round"
    stroke-linejoin="round"
    width={size}
    height={size}
    class={cls}
    style={style || undefined}
    aria-hidden="true"
  >
    {#each glyph as [tag, attrs]}
      {#if tag === 'path'}
        <path {...attrs} />
      {:else if tag === 'circle'}
        <circle {...attrs} />
      {:else if tag === 'rect'}
        <rect {...attrs} />
      {:else if tag === 'line'}
        <line {...attrs} />
      {:else if tag === 'polyline'}
        <polyline {...attrs} />
      {:else if tag === 'polygon'}
        <polygon {...attrs} />
      {/if}
    {/each}
  </svg>
{:else}
  <svg {...rest} viewBox="0 0 16 16" width={size} height={size} class={cls} style={style || undefined} aria-hidden="true">
    <path d={drawn} fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="round" stroke-linejoin="round" />
  </svg>
{/if}
