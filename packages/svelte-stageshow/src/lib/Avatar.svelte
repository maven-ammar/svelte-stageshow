<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import { getLook } from './look.js'

  type Tone = 'accent' | 'ink' | 'success' | 'person' | 'ios'
  type Ring = 'pending' | 'waiting' | 'confirmed' | 'declined'

  interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'class'> {
    /** Its initial. Leave it out (or set `plain`) for a plain disc. */
    name?: string
    /** A plain disc in any fidelity: filler people, so they don't compete with the named one. */
    plain?: boolean
    size?: number
    tone?: Tone
    src?: string
    ring?: Ring
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
  }

  let { name = '', plain = false, size = 24, tone, src, ring, className = '', class: klass = '', style = '', ...rest }: Props = $props()

  // Six muted, opaque fills that read on light and dark grounds, one per person
  const PEOPLE = ['#c98f6e', '#6f9b7d', '#7b86c7', '#c47a9e', '#8c9ab0', '#c2a35a']
  const hue = (value: string) => {
    let h = 0
    for (const c of value) h = (h * 31 + c.charCodeAt(0)) % 9973
    return PEOPLE[h % PEOPLE.length]
  }

  const look = getLook()
  const disc = $derived(plain || look.fidelity === 'minimal')
  const toneValue: Tone = $derived(tone ?? (name ? 'person' : 'ink'))
  const person = $derived(toneValue === 'person' && !disc ? `background:${hue(name)};color:#fff;` : '')
  const words = $derived(name.trim().split(/\s+/).filter(Boolean))
  const initials = $derived(
    toneValue === 'ios' ? (words[0]?.[0] ?? '') + (words.length > 1 ? words[words.length - 1]![0] : '') : (name.trim()[0] ?? ''),
  )
  const fontSize = $derived(Math.round(size * (toneValue === 'ios' ? 0.4 : size < 24 ? 0.5 : 0.42)))
  const css = $derived(`width:${size}px;height:${size}px;font-size:${fontSize}px;${person}${style}`)
</script>

<span
  {...rest}
  class={`ss-avatar${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}
  data-tone={toneValue}
  data-ring={ring}
  style={css}
>
  {#if src && !disc}
    <img {src} alt="" />
  {:else if !disc}
    <span class="ss-avatar__initial">{initials.toUpperCase()}</span>
  {/if}
</span>
