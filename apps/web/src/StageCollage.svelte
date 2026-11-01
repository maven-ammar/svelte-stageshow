<script lang="ts">
  import HeroDemo from './scenes/HeroDemo.svelte'
  import StaticCard from './scenes/StaticCard.svelte'

  // A composition, not a screenshot: the kit's own scenes, framed the way its rules
  // ask — one window bleeding off the right edge, one card straddling its corner,
  // one gutter between them. Authored at a fixed design size and scaled as a whole.
</script>

<div class="fit">
  <div class="collage" aria-hidden="true">
    <div class="window">
      <div class="scene window-scene">
        <HeroDemo />
      </div>
    </div>
    <div class="card">
      <div class="scene card-scene">
        <StaticCard />
      </div>
    </div>
  </div>
</div>

<style>
  .fit {
    --k: 0.7;
    position: relative;
    width: 100%;
    height: calc(560px * var(--k));
  }

  .collage {
    position: absolute;
    top: 0;
    left: 50%;
    width: 720px;
    height: 560px;
    transform: translateX(-50%) scale(var(--k));
    transform-origin: top center;
  }

  .window,
  .card {
    position: absolute;
    overflow: hidden;
    border-radius: 10px;
    border: 1px solid rgba(244, 241, 230, 0.14);
    box-shadow: 0 40px 90px -50px rgba(0, 0, 0, 0.95);
    background: #0f0d0c;
  }

  .window {
    left: 70px;
    top: 0;
    width: 640px;
    height: 300px;
  }

  .card {
    left: 0;
    top: 250px;
    width: 270px;
    height: 202px;
    border-color: rgba(244, 241, 230, 0.2);
    background: #f4f1e6;
  }

  .scene {
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: top left;
    pointer-events: none;
  }

  /* HeroDemo is authored at 720x340; scale to the 640px window. */
  .window-scene {
    width: 720px;
    height: 340px;
    transform: scale(0.889);
  }

  /* StaticCard is authored at 400x300; scale to the 270px card. */
  .card-scene {
    width: 400px;
    height: 300px;
    transform: scale(0.675);
  }

  /* The scaled box keeps its authored size, so reserve the scaled footprint. */
  .window::after,
  .card::after {
    content: '';
    display: block;
  }

  @media (max-width: 1240px) {
    .fit {
      --k: 0.6;
    }
  }

  @media (max-width: 1080px) {
    .fit {
      --k: 0.66;
    }
  }

  @media (max-width: 760px) {
    .fit {
      --k: 0.44;
    }
  }
</style>
