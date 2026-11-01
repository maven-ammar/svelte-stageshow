<script lang="ts">
  import { Stage, type Act } from 'svelte-stageshow'
  import './cursor-resize.css'

  // The resize cursors, on one selected frame. The cursor starts as the arrow
  // and turns into the triangles the moment it crosses a handle. Each handle
  // says its kind with data-cursor; the script only moves and drags, and every
  // drag is undone by another, so the loop starts where it ends.

  type S = { x: number; y: number; w: number; h: number; held: string | null }
  const START: S = { x: 120, y: 70, w: 200, h: 140, held: null }

  const pull = async (
    a: Act<S>,
    handle: string,
    dx: number,
    dy: number,
    apply: (s: S, mx: number, my: number) => Partial<S>,
  ) => {
    await a.move(handle)
    const from = a.center(handle)
    let base: S | null = null
    await a.set((s) => {
      base = s
      return { held: handle }
    })
    await a.drag(
      { x: from.x + dx, y: from.y + dy },
      (p, o) => a.put(apply(base!, Math.round(p.x - o.x), Math.round(p.y - o.y))),
      { duration: 750, cursor: 'preserve' },
    )
    await a.set({ held: null })
    await a.wait(350)
  }

  const script = async (a: Act<S>) => {
    await a.wait(600)
    await pull(a, 'edge-s', 0, 30, (s, _, my) => ({ h: s.h + my }))
    await pull(a, 'edge-e', 40, 0, (s, mx) => ({ w: s.w + mx }))
    await pull(a, 'corner-se', -40, -30, (s, mx, my) => ({ w: s.w + mx, h: s.h + my }))
    await pull(a, 'corner-ne', 30, -24, (s, mx, my) => ({ w: s.w + mx, y: s.y + my, h: s.h - my }))
    await pull(a, 'corner-ne', -30, 24, (s, mx, my) => ({ w: s.w + mx, y: s.y + my, h: s.h - my }))
    await a.move('rest')
    await a.wait(700)
  }

  const HANDLES: [string, string, string][] = [
    ['edge-n', 'resize-ns', 'n'], ['edge-s', 'resize-ns', 's'], ['edge-w', 'resize-ew', 'w'], ['edge-e', 'resize-ew', 'e'],
    ['corner-nw', 'resize-nwse', 'nw'], ['corner-se', 'resize-nwse', 'se'], ['corner-ne', 'resize-nesw', 'ne'], ['corner-sw', 'resize-nesw', 'sw'],
  ]
</script>

<Stage specimen width={440} height={300} initial={START} {script} cursor={{ at: { x: 64, y: 252 } }}>
  {#snippet children(s)}
    <div class="cr-canvas">
      <div class="cr-frame" style={`left:${s.x}px;top:${s.y}px;width:${s.w}px;height:${s.h}px`}>
        <div class="cr-fill"></div>
        {#each HANDLES as [target, kind, side] (target)}
          <i class="cr-handle" data-side={side} data-target={target} data-cursor={kind} data-held={s.held === target || undefined}></i>
        {/each}
        <span class="cr-size">{s.w} × {s.h}</span>
      </div>
      <span class="cr-rest" data-target="rest"></span>
    </div>
  {/snippet}
</Stage>
