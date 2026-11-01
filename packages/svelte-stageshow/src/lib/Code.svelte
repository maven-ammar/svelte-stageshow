<script lang="ts">
  import { tokenize, type CodeLine, type CodeToken } from './code.js'

  interface RenderedLine {
    text: string
    kind?: 'add' | 'del'
    /** '' for a removed line or a continuation, so the gutter stays blank. */
    displayNum: number | string
    tokens: CodeToken[]
  }

  interface Props {
    lines: (CodeLine | string)[]
    start?: number
    numbers?: boolean
    count?: number
    highlight?: boolean
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
  }

  let {
    lines,
    start = 1,
    numbers = true,
    count,
    highlight = true,
    className = '',
    class: klass = '',
    style = '',
  }: Props = $props()

  let el = $state<HTMLDivElement | null>(null)

  // A removed line keeps the old number; the line after it reuses it.
  const rendered = $derived.by<RenderedLine[]>(() => {
    let n = start
    return lines.map((raw) => {
      const line = typeof raw === 'string' ? { text: raw } : raw
      const num = line.kind === 'del' || line.number === false ? n : n++
      return {
        text: line.text,
        kind: line.kind,
        displayNum: line.kind === 'del' || line.number === false ? '' : num,
        tokens: tokenize(line.text),
      }
    })
  })

  // Only lines that really run past the block fade at the edge.
  $effect(() => {
    const root = el
    if (!root) return
    // Re-measure whenever the rendered lines (or the gutter) change.
    void rendered
    void numbers
    void count
    void highlight
    const mark = () => {
      root.querySelectorAll<HTMLElement>('.ss-code__text').forEach((t) => {
        t.toggleAttribute('data-over', t.scrollWidth > t.clientWidth + 1)
      })
    }
    mark()
    const ro = new ResizeObserver(mark)
    ro.observe(root)
    return () => ro.disconnect()
  })
</script>

<div
  bind:this={el}
  class={`ss-code${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}
  style={style || undefined}
>
  {#each rendered as line, i (i)}
    <div
      class="ss-code__line"
      data-kind={line.kind}
      data-on={count === undefined || i < count || undefined}
    >
      {#if numbers}<span class="ss-code__num">{line.displayNum}</span>{/if}
      <span class="ss-code__mark">{line.kind === 'add' ? '+' : line.kind === 'del' ? '−' : ''}</span>
      <span class="ss-code__text">
        {#if highlight}
          {#each line.tokens as token, ti (ti)}
            {#if token.kind}<span class={`ss-code__${token.kind}`}>{token.text}</span>{:else}{token.text}{/if}
          {/each}
        {:else}{line.text}{/if}
      </span>
    </div>
  {/each}
</div>
