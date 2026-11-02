<script lang="ts">
  import StageCollage from './StageCollage.svelte'
  import './dot-hero.css'

  // The hero: a warm bloom on near-black, grain over it, the claim in Instrument
  // Serif on the left, and a real stageshow composition on the right — the kit
  // demonstrating itself rather than a picture of itself.
</script>

<section class="dot-hero">
  <div class="dot-hero__wash"></div>
  <div class="dot-hero__grain"></div>

  <div class="dot-hero__inner">
    <div class="dot-hero__copy">
      <p class="dot-hero__eyebrow">A Svelte 5 port of Stageshow</p>
      <h1>Product shots that hold up as product.</h1>
      <p class="dot-hero__sub">
        Window frames with real chrome, a cursor that types and clicks under a script, sixty-nine
        worked scenes to start from.
      </p>
      <div class="dot-hero__actions">
        <code>pnpm add svelte-stageshow</code>
        <a href="?scene=static-card">Open the gallery</a>
      </div>
    </div>

    <div class="dot-hero__stage">
      <StageCollage />
    </div>
  </div>
</section>
