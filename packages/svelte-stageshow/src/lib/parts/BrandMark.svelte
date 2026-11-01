<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import { getLook } from '../look.js'
  import { brandMarks, type BrandAsset, type BrandName } from '../brands.js'

  interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'class' | 'children'> {
    brand?: BrandName
    name?: string
    src?: string
    size?: number
    width?: number
    tile?: boolean
    /** The surface behind the mark. Defaults to the Stage theme. */
    surface?: 'light' | 'dark'
    className?: string
    /** Svelte's own class attribute; merged after className. */
    class?: string
    style?: string
  }

  let { brand, name, src, size = 28, width, tile = true, surface, className = '', class: klass = '', style = '', ...rest }: Props = $props()

  const look = getLook()
  const asset = $derived(brand ? (brandMarks[brand] as BrandAsset) : undefined)
  const dark = $derived((surface ?? (look.theme === 'dark' || look.theme === 'blueprint' ? 'dark' : 'light')) === 'dark')
  const label = $derived(name ?? asset?.name ?? '')
  const image = $derived(src ?? (tile && asset?.tileArtwork ? asset.tileArtwork : dark ? asset?.dark : asset?.light))
  const frameWidth = $derived(width ?? (asset && !src ? Math.round(size * asset.proportion) : size))
  // Full-color marks without a supplied dark variant keep their original
  // artwork on a light tile. Bare marks leave surface choice to the caller.
  const lightTile = $derived(tile && dark && asset && !src && asset.dark === asset.light)

  const frameStyle = $derived(
    `width:${frameWidth}px;height:${size}px;border-radius:${Math.round(size * 0.24)}px;${
      tile && asset && !src && asset.tileBackground ? `background:${asset.tileBackground};` : ''
    }${style}`,
  )
  const imgStyle = $derived(asset && !src && tile ? `width:${asset.scale * 100}%;height:${asset.scale * 100}%` : undefined)
  const initialSize = $derived(Math.round(size * (size < 24 ? 0.5 : 0.42)))
</script>

<span
  {...rest}
  class={`ss-brand${className ? ` ${className}` : ''}${klass ? ` ${klass}` : ''}`}
  data-tile={tile || undefined}
  data-light-tile={lightTile || undefined}
  data-brand={brand}
  style={frameStyle}
  role="img"
  aria-label={label}
>
  {#if image && look.fidelity !== 'minimal'}
    <img src={image} alt="" draggable="false" style={imgStyle} />
  {:else}
    <span class="ss-brand__initial" style={`font-size:${initialSize}px`}>
      {look.fidelity === 'minimal' ? '' : (label.trim()[0]?.toUpperCase() ?? '')}
    </span>
  {/if}
</span>
