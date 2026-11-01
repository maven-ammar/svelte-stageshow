<script lang="ts">
  import HeroIcon from './HeroIcon.svelte'

  interface Props {
    open: boolean
    copied: boolean
  }

  let { open, copied }: Props = $props()
</script>

<div class="hd-toolbar" data-target="toolbar" data-cursor="hand" data-open={open ? 'true' : undefined}>
  <div class="hd-toolbar-icon">
    <HeroIcon name="list-sparkle" size={20} />
  </div>
  <div class="hd-toolbar-buttons">
    <div class="hd-toolbar-btn">
      <HeroIcon name="pause" />
    </div>
    <div class="hd-toolbar-btn">
      <HeroIcon name="eye" />
    </div>
    <div class="hd-toolbar-btn" data-target="copy" data-cursor="hand" data-active={copied ? 'true' : undefined}>
      {#if copied}
        <HeroIcon name="check" />
      {:else}
        <HeroIcon name="copy" />
      {/if}
    </div>
    <div class="hd-toolbar-btn">
      <HeroIcon name="trash" />
    </div>
    <div class="hd-toolbar-btn">
      <HeroIcon name="gear" />
    </div>
    <div class="hd-toolbar-divider"></div>
    <div class="hd-toolbar-btn">
      <HeroIcon name="x" />
    </div>
  </div>
</div>
