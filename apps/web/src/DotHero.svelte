<script lang="ts">
  import './dot-hero.css'

  // The hero band: a soft warm bloom on near-black, the Svelte mark as dot lattice,
  // and the headline set in Instrument Serif over it. Grain over everything so the
  // gradient reads as pigment instead of a CSS ramp.
</script>

<section class="dot-hero">
  <div class="dot-hero__wash"></div>
  <div class="dot-hero__grain"></div>
  <img class="dot-hero__mark" src="/svelte-dots.png" alt="" aria-hidden="true" />

  <div class="dot-hero__content">
    <p class="dot-hero__eyebrow">A Svelte 5 port of Stageshow</p>
    <h1>Product shots that hold up as product.</h1>
    <p class="dot-hero__sub">
      Window frames with real chrome, a cursor that types and clicks under a script, sixty-nine
      worked scenes to start from. The design rules travel with it.
    </p>
    <div class="dot-hero__actions">
      <code>pnpm add svelte-stageshow</code>
      <a href="?scene=static-card">Open the gallery</a>
    </div>
  </div>
</section>
