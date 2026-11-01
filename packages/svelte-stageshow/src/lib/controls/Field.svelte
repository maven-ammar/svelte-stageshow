<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import Icon from '../parts/Icon.svelte'

  type BoxProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & { className?: string }

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class' | 'placeholder'> {
    label?: string | Snippet
    /** The typed value. Drive it with act.type(). */
    value: string
    placeholder?: string | Snippet
    /** Focus ring and a blinking caret. */
    focused?: boolean
    /** Dots instead of the value. */
    password?: boolean
    /** valid: a check at the end and a calm ring. error: the ring turns danger. */
    status?: 'valid' | 'error'
    /** The typed value committed as a chip, in place (a filter on Enter): the
     * text stays where it was typed while a surface grows around it. Clear the
     * value and the chip together; the chip fades out holding its text. */
    chip?: boolean
    /** Gives the chip a remove ×, with this data-target for the cursor. */
    remove?: string
    leading?: Snippet
    trailing?: Snippet
    /** Props for the input box itself, the thing to click: data-target, data-cursor. */
    box?: BoxProps
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
  }

  let {
    label,
    value,
    placeholder,
    focused,
    password,
    status,
    chip,
    remove,
    leading,
    trailing,
    box,
    className = '',
    class: klass = '',
    style = '',
    ...rest
  }: Props = $props()

  // A cleared chip keeps its text while it fades, then lets go. Held in the
  // pre-effect so the first frame after the clear already shows it.
  let held = $state('')
  let textEl = $state<HTMLSpanElement | null>(null)

  $effect.pre(() => {
    if (chip || value) held = chip ? value : ''
  })

  const out = $derived(!chip && !value && !!held)
  const shown = $derived(out ? held : value)

  function letGo() {
    if (!held) return
    held = ''
  }

  // Keep the text only while its fade is visible. A stage reset can disable
  // the transition before it starts, or cancel it halfway through.
  $effect(() => {
    const el = textEl
    if (!out || !el) return
    const check = () => {
      if (Number(getComputedStyle(el).opacity) === 0) letGo()
    }
    const settle = (event: TransitionEvent) => {
      if (event.target === el && event.propertyName === 'opacity') check()
    }
    el.addEventListener('transitionend', settle)
    el.addEventListener('transitioncancel', settle)
    check()
    return () => {
      el.removeEventListener('transitionend', settle)
      el.removeEventListener('transitioncancel', settle)
    }
  })

  const boxParts = $derived.by(() => {
    const { class: boxClass = '', className: boxClassName = '', ...boxRest } = box ?? {}
    return {
      rest: boxRest,
      klass: `${boxClassName}${boxClass ? `${boxClassName ? ' ' : ''}${boxClass}` : ''}`,
    }
  })
</script>

<div
  {...rest}
  class={`ss-field${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}
  data-focused={focused || undefined}
  data-status={status}
  data-filled={value ? true : undefined}
  style={style || undefined}
>
  {#if label}
    <span class="ss-field__label">{#if typeof label === 'string'}{label}{:else}{@render label()}{/if}</span>
  {/if}
  <div data-cursor="ibeam" {...boxParts.rest} class={`ss-field__box${boxParts.klass ? ` ${boxParts.klass}` : ''}`}>
    {#if leading}{@render leading()}{/if}
    <span class="ss-field__text">
      {#if placeholder}
        <span class="ss-field__placeholder">{#if typeof placeholder === 'string'}{placeholder}{:else}{@render placeholder()}{/if}</span>
      {/if}
      <span
        bind:this={textEl}
        class="ss-field__value"
        data-password={password || undefined}
        data-chip={chip || out || undefined}
        data-leaving={out || undefined}
        data-removable={remove !== undefined || undefined}
      >
        <span class="ss-field__chars">{password ? '•'.repeat(shown.length) : shown}</span>
        {#if remove !== undefined}
          <span class="ss-field__x" role="button" data-cursor="hand" data-target={remove || undefined}>
            <Icon name="close" size={10} stroke={1.8} />
          </span>
        {/if}
      </span>
      {#if focused}
        <!-- Keyed on the value, so every keystroke restarts the blink from solid -->
        {#key value.length}
          <span class="ss-field__caret"></span>
        {/key}
      {/if}
    </span>
    {#if status === 'valid'}
      <svg class="ss-field__ok" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <path d="M3.5 8.5 6.5 11.5 12.5 4.5" pathLength={1} />
      </svg>
    {/if}
    {#if trailing}{@render trailing()}{/if}
  </div>
</div>
