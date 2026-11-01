<script lang="ts">
  import { Stage } from 'svelte-stageshow'
  import './dot-hero.css'

  // The hero plate: the Svelte mark as dot-lattice art on a warm wash that runs
  // purple at the top through coral to orange at the floor, with a fine grain
  // over it so the gradient reads as pigment rather than a CSS ramp.
</script>

<Stage width={720} height={400} className="dot-hero" unframed>
  {#snippet children()}
    <div class="dot-hero__wash"></div>
    <div class="dot-hero__grain"></div>
    <img class="dot-hero__mark" src="/svelte-dots.png" alt="Svelte, drawn in dots" />
    <p class="dot-hero__caption">
      <span class="dot-hero__label">svelte 5</span>
      <span class="dot-hero__note">the kit, ported</span>
    </p>
  {/snippet}
</Stage>
