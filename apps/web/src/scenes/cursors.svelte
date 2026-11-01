<script lang="ts">
  import { Icon, Stage, States, Window, type Act, type CursorStyle } from 'svelte-stageshow'
  import './cursors.css'

  // One small invoice form, driven four ways: the real macOS cursor, a larger
  // one for small or busy embeds, a glass circle for a gestural, touch-like
  // feel, and no cursor at all. Each element says its cursor with data-cursor.

  type S = { name: string; focus: string | null; typing: boolean; terms: number; disc: number; select: boolean; note: boolean }
  const START: S = { name: '', focus: null, typing: false, terms: 0, disc: 0, select: false, note: false }

  const TRACK = { w: 112 }

  const withCursor = async (a: Act<S>) => {
    await a.wait(500)
    // Text: an I-beam from the moment it's over the field
    await a.move({ at: 'field', x: 0.3, y: 0.5 })
    await a.click()
    a.put({ typing: true })
    await a.type('name', 'Ada Lovelace')
    // Options: a pointing hand
    await a.move({ at: 'net-1', x: 0.9, y: 0.7 })
    await a.click()
    a.put({ terms: 1, typing: false })
    // Dragging: a closed hand while it's held
    await a.move('handle')
    const track = a.rect('track')
    await a.drag({ at: 'track', x: 0.5, y: 0.5 }, (at) => a.put({ disc: Math.max(0, Math.min(1, (at.x - track.x) / track.width)) }))
    await a.wait(300)
    // A link
    await a.move('add-note')
    await a.click()
    a.put({ note: true })
    await a.move('rest')
    await a.wait(1400)
    // Put it back by hand, so the reset has a cause
    await a.move('handle')
    await a.drag({ at: 'track', x: 0, y: 0.5 }, (at) => a.put({ disc: Math.max(0, Math.min(1, (at.x - track.x) / track.width)) }))
    await a.click('remove-note')
    a.put({ note: false })
    await a.click({ at: 'net-0', x: 0.9, y: 0.7 })
    a.put({ terms: 0 })
    await a.move({ at: 'field', x: 0.5, y: 0.5 })
    await a.click()
    a.put({ select: true })
    await a.wait(350)
    a.put({ name: '', select: false })
    await a.move('rest')
    await a.wait(500)
  }

  const withoutCursor = async (a: Act<S>) => {
    await a.wait(650)
    await a.set({ focus: 'field', typing: true })
    await a.wait(350)
    await a.type('name', 'Ada Lovelace')
    await a.set({ focus: null, typing: false })
    await a.wait(500)
    await a.set({ terms: 1 })
    await a.wait(650)
    await a.set({ disc: 0.5 })
    await a.wait(900)
    await a.set({ note: true })
    await a.wait(1600)
  }

  const MODES = ['real', 'large', 'circle', 'none'] as const
</script>

{#snippet noteEmpty()}
  <span class="crs-link" data-target="add-note" data-cursor="hand">Add a note</span>
{/snippet}

{#snippet noteAdded()}
  <span class="crs-note-content">Thank you, Ada.<span class="crs-note-remove" data-target="remove-note" data-cursor="hand" aria-label="Remove note"><Icon name="close" size={10} /></span></span>
{/snippet}

{#snippet scene(mode: CursorStyle | 'none')}
  {@const cursorCfg = mode === 'none' ? undefined : { at: 'rest', style: mode }}
  <Stage
    specimen
    width={340}
    height={240}
    compact={{ below: 340, width: 288, height: 240 }}
    initial={START}
    poster={{ ...START, name: 'Ada Lovelace', terms: 1, disc: 0.5, note: true }}
    script={mode === 'none' ? withoutCursor : withCursor}
    play={mode === 'none' ? 'once' : 'loop'}
    cursor={cursorCfg}
    className="crs"
  >
    {#snippet children(s, _r, layout)}
      <Window className="crs-window" title="New invoice" data-system={mode === 'none' || undefined}>
        <div class="crs-body">
          <div class="crs-row">
            <span class="crs-label">Customer</span>
            <span class="crs-field" data-target="field" data-cursor="ibeam" data-focus={s.typing || s.focus === 'field' || undefined}>
              <span class="crs-value" data-select={s.select || undefined}>
                {s.name}
              </span>
              {#if s.typing}<span class="crs-caret"></span>{/if}
              {#if !s.name && !s.typing}<span class="crs-placeholder">Search customers</span>{/if}
            </span>
          </div>
          <div class="crs-row">
            <span class="crs-label">Terms</span>
            <span class="crs-seg">
              {#each ['Net 15', 'Net 30'] as p, i (p)}
                <span data-target={`net-${i}`} data-cursor="hand" data-on={s.terms === i || undefined}>
                  {p}
                </span>
              {/each}
            </span>
          </div>
          <div class="crs-row">
            <span class="crs-label">Discount</span>
            <span class="crs-slider">
              <span class="crs-track" data-target="track" style={`width:${TRACK.w}px`}>
                <span class="crs-fill" style={`width:${s.disc * 100}%`}></span>
                <span class="crs-handle" data-target="handle" data-cursor="open" style={`left:${s.disc * 100}%`}></span>
              </span>
              <span class="crs-pct">{Math.round(s.disc * 20)}%</span>
            </span>
          </div>
          <div class="crs-row">
            <span class="crs-label"></span>
            <States className="crs-note" value={s.note ? 'added' : 'empty'} align="start" states={{ empty: noteEmpty, added: noteAdded }} />
          </div>
        </div>
      </Window>
      <span data-target="rest" style={`position:absolute;left:${layout === 'compact' ? 260 : 300}px;top:214px`}></span>
    {/snippet}
  </Stage>
{/snippet}

<div class="crs-grid">
  {#each MODES as c (c)}
    <figure>
      {@render scene(c)}
      <figcaption>{c === 'none' ? 'no cursor' : c}</figcaption>
    </figure>
  {/each}
</div>
