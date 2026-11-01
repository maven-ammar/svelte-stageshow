<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'

  interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'class' | 'children'> {
    text: string
    count: number
    mark?: (word: string, i: number) => boolean
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
  }

  let {
    text,
    count,
    mark,
    className = '',
    class: klass = '',
    style = '',
    ...rest
  }: Props = $props()

  const words = $derived(text.split(' '))
  const marked = $derived(words.map((w, i) => !!mark?.(w, i)))
</script>

<span {...rest} class={`ss-stream${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`} style={style}>{#each words as w, i (i)}{@const join = marked[i] && marked[i + 1]}<span><span class="ss-stream__w" data-on={i < count || undefined} data-mark={marked[i] || undefined} data-join={join || undefined} data-joined={(marked[i] && marked[i - 1]) || undefined}>{w}{join ? ' ' : ''}</span>{!join && i < words.length - 1 ? ' ' : ''}</span>{/each}</span>
