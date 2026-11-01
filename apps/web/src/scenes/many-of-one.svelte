<script lang="ts">
  import { Badge, Bar, Stage, Text } from 'svelte-stageshow'
  import './many-of-one.css'

  // Many of one: a grid of the same small thing, one of them in focus. Here,
  // preview deployments, one per branch. A still.
  //
  // What makes repetition read as an image, not a wall:
  // - Every tile is the same anatomy at the same size: a thumbnail, a line, a
  //   status. The sameness is the point; vary only the bar lengths.
  // - The grid runs off every edge, so it reads as going on. Every edge cuts a
  //   tile by a third or more, never to a sliver. The focus tile sits off
  //   center, a column right of the middle: centered, the outer columns would be
  //   slivers.
  // - The focus tile is the only one with words and color. It stays in its
  //   cell, the same size, and comes forward by depth: the hero shadow and a
  //   ring in the accent. The others are quiet, not faded or blurred.
  //
  // Real strings: the focus tile's branch, its commit and its status.

  const COLS = 5
  const ROWS = 4
  const FOCUS = { col: 2, row: 1 }

  const W = [[96, 64], [80, 52], [104, 70], [72, 58], [90, 46]]
</script>

<Stage width={640} height={360} compact={{ below: 600, width: 358, height: 360 }} className="mo">
  {#snippet children()}
    <div class="mo-grid">
      {#each Array.from({ length: ROWS * COLS }) as _, i}
        {@const col = i % COLS}
        {@const row = Math.floor(i / COLS)}
        {@const focus = col === FOCUS.col && row === FOCUS.row}
        {@const tile = W[(i * 3) % W.length]!}
        {#if focus}
          <div class="mo-tile" data-focus>
            <div class="mo-thumb mo-thumb--focus">
              <span class="mo-thumb__head"></span>
              <span class="mo-thumb__line"></span>
              <span class="mo-thumb__line mo-thumb__line--short"></span>
            </div>
            <div class="mo-meta">
              <Text className="mo-branch">pricing-copy</Text>
              <Badge tone="success" dot>Ready</Badge>
            </div>
            <Text className="mo-commit">New annual plan wording</Text>
          </div>
        {:else}
          <div class="mo-tile">
            <div class="mo-thumb"></div>
            <div class="mo-meta">
              <Bar w={tile[0]} h={8} r={4} tone={3} />
              <Bar w={34} h={8} r={4} tone={2} />
            </div>
            <Bar w={tile[1]} h={7} r={3.5} tone={2} />
          </div>
        {/if}
      {/each}
    </div>
  {/snippet}
</Stage>
