<script lang="ts">
  import { Avatar, Bar, Facepile, Stage, Text, Window } from 'svelte-stageshow'
  import './dark-bento.css'

  // A bento card (360 x 280) for a music app, in a dark section of the page.
  // Feature: shared playlists: "shared" is said once, by one link.

  const TRACKS: { title?: number; artist?: number; added?: boolean; art: number }[] = [
    { title: 62, artist: 40, art: 1 },
    { title: 48, artist: 54, art: 2 },
    { added: true, art: 3 },
    { title: 70, artist: 36, art: 4 },
    { title: 56, artist: 46, art: 5 },
  ]
</script>

<Stage width={360} height={280} compact={{ below: 360, width: 358, height: 280 }} theme="dark" palette="mono" className="db-card">
  {#snippet children()}
    <Window className="db-window" lights="grey">
      <aside class="db-sidebar">
        {#each [46, 52, 40] as w, i (i)}
          <div class="db-nav">
            <Bar w={10} h={10} r={3} tone={i === 2 ? 4 : 2} />
            <Bar w={w} h={5} tone={i === 2 ? 4 : 2} />
          </div>
        {/each}
      </aside>

      <div class="db-main">
        <header class="db-header">
          <span class="db-art db-art--cover"></span>
          <div class="db-heading">
            <Text className="db-title">Sunday Slow</Text>
            <div class="db-people">
              <!-- Cut out, not ringed: the gap shows the window behind -->
              <Facepile names={['', '', '', '']} tones={['ink', 'ink', 'ink', 'ink']} size={18} overlap={4} className="db-pile" />
            </div>
          </div>
        </header>

        <div class="db-list">
          {#each TRACKS as t, i (i)}
            {#if t.added}
              <div class="db-row" data-new>
                <span class="db-row-art">
                  <span class={`db-art db-art--${t.art} db-art--row`}></span>
                  <Avatar name="Mara" size={14} className="db-face db-face--row" style="color:#111113" />
                </span>
                <div class="db-lines">
                  <Bar w={58} h={5} tone={5} />
                  <Bar w={38} h={4} tone={3} />
                </div>
              </div>
            {:else}
              <div class="db-row">
                <span class={`db-art db-art--${t.art} db-art--row`}></span>
                <div class="db-lines">
                  <Bar w={t.title!} h={5} tone={3} />
                  <Bar w={t.artist!} h={4} tone={2} />
                </div>
              </div>
            {/if}
          {/each}
        </div>
      </div>
    </Window>

    <!-- Satellite: the song Mara just added, over the sidebar -->
    <div class="db-detail">
      <div class="db-detail-track">
        <span class="db-art db-art--3 db-art--detail"></span>
        <div class="db-lines">
          <Bar w={58} h={5} tone={5} />
          <Bar w={38} h={4} tone={3} />
        </div>
      </div>
      <div class="db-detail-by">
        <Avatar name="Mara" size={20} className="db-face db-face--detail" style="color:#111113" />
        <Text className="db-by">Added by Mara</Text>
      </div>
    </div>
  {/snippet}
</Stage>
