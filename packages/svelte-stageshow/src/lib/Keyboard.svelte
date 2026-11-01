<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'

  // The iOS 27 keyboard, at true points inside a Phone: the Liquid Glass sheet
  // with its predictive bar, softly rounded keys with wide gaps, special keys
  // the same color as the letters, a ↵ return key, and the emoji and dictation
  // buttons below the keys. Measured from iOS 27 screenshots.

  const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> {
    /**
     * The text typed so far. Each new character pops its key, and shift follows
     * iOS's auto-capitalisation (on at the start and after a sentence ends).
     */
    typed?: string
    /** Force shift on or off instead of following the text. */
    shift?: boolean
    /** The three words in the predictive bar. */
    suggestions?: [string, string, string]
    /** A key held down: a letter, or 'shift', 'delete', 'return', 'space', '123'. */
    pressed?: string | null
    dark?: boolean
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
  }

  let {
    typed = '',
    shift,
    suggestions = ['I', 'The', 'I’m'],
    pressed,
    dark,
    className = '',
    class: klass = '',
    style = '',
    ...rest
  }: Props = $props()

  // The key that just landed, shown in its callout for a moment
  let pop = $state<{ ch: string; n: number } | null>(null)
  let popN = 0
  let last: string | null = null

  $effect(() => {
    const was = last ?? typed
    last = typed
    if (typed.length <= was.length || !typed.startsWith(was)) return
    const ch = typed[typed.length - 1].toLowerCase()
    pop = { ch, n: ++popN }
    const id = setTimeout(() => (pop = null), 140)
    return () => clearTimeout(id)
  })

  const auto = $derived(typed === '' || /[.!?]\s$/.test(typed))
  const upper = $derived(shift ?? auto)
  const down = (k: string) => pressed === k || (k.length === 1 && pop?.ch === k)
</script>

{#snippet glyph(name: 'shift' | 'shift-on' | 'delete' | 'return' | 'emoji' | 'mic')}
  {#if name === 'shift' || name === 'shift-on'}
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        d="M12 3.6 3.4 12.4H8v7.4h8v-7.4h4.6Z"
        fill={name === 'shift-on' ? 'currentColor' : 'none'}
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
    </svg>
  {:else if name === 'delete'}
    <svg viewBox="0 0 26 24" width="24" height="22" aria-hidden="true">
      <path
        d="M8.6 4.5h13.2a2.2 2.2 0 0 1 2.2 2.2v10.6a2.2 2.2 0 0 1-2.2 2.2H8.6L2 12Z"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
      <path
        d="m11.4 8.6 6.8 6.8m0-6.8-6.8 6.8"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
    </svg>
  {:else if name === 'return'}
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        d="M19.5 5.5v6.2a2.3 2.3 0 0 1-2.3 2.3H5"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
      <path
        d="m9.2 9.6-4.4 4.4 4.4 4.4"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
    </svg>
  {:else if name === 'emoji'}
    <svg viewBox="0 0 28 28" width="28" height="28" aria-hidden="true">
      <circle cx="14" cy="14" r="12.5" fill="currentColor" />
      <ellipse cx="10" cy="10.6" rx="1.5" ry="2.1" fill="var(--ss-kb-sheet)" />
      <ellipse cx="18" cy="10.6" rx="1.5" ry="2.1" fill="var(--ss-kb-sheet)" />
      <path d="M7.4 15.2c.9 3.6 3.6 5.8 6.6 5.8s5.7-2.2 6.6-5.8Z" fill="var(--ss-kb-sheet)" />
    </svg>
  {:else if name === 'mic'}
    <svg viewBox="0 0 24 28" width="22" height="26" aria-hidden="true">
      <rect x="7.6" y="2" width="8.8" height="15" rx="4.4" fill="currentColor" />
      <path
        d="M4.2 12.8a7.8 7.8 0 0 0 15.6 0M12 20.6V26M8 26h8"
        fill="none"
        stroke="currentColor"
        stroke-width="1.9"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
    </svg>
  {/if}
{/snippet}

<div
  {...rest}
  class={`ss-kb${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}
  data-dark={dark || undefined}
  style={style || undefined}
>
  <div class="ss-kb__suggest">
    {#each suggestions as w, i (i)}
      <span>{w}</span>
    {/each}
  </div>
  {#each ROWS as row, r (r)}
    <div class="ss-kb__row" data-row={r}>
      {#if r === 2}
        <span class="ss-kb__key ss-kb__key--wide" data-down={down('shift') || undefined}>
          {@render glyph(upper ? 'shift-on' : 'shift')}
        </span>
      {/if}
      {#each row.split('') as k (k)}
        <span class="ss-kb__key" data-down={down(k) || undefined}>
          {upper ? k.toUpperCase() : k}
          {#if pop?.ch === k}
            {#key pop?.n}
              <span class="ss-kb__callout" aria-hidden="true">{upper ? k.toUpperCase() : k}</span>
            {/key}
          {/if}
        </span>
      {/each}
      {#if r === 2}
        <span class="ss-kb__key ss-kb__key--wide" data-down={down('delete') || undefined}>
          {@render glyph('delete')}
        </span>
      {/if}
    </div>
  {/each}
  <div class="ss-kb__row ss-kb__row--bottom">
    <span class="ss-kb__key ss-kb__key--mode" data-down={down('123') || undefined}>123</span>
    <span class="ss-kb__key ss-kb__key--space" data-down={down('space') || down(' ') || undefined}></span>
    <span class="ss-kb__key ss-kb__key--mode" data-down={down('return') || undefined}>
      {@render glyph('return')}
    </span>
  </div>
  <div class="ss-kb__below">
    {@render glyph('emoji')}
    {@render glyph('mic')}
  </div>
</div>
