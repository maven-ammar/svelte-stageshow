<script lang="ts">
  import { Avatar, Bar, Facepile, Row, Stage, Text, Window, type Act } from 'svelte-stageshow'
  import './corner-chip.css'

  // A satellite chip pinned to a corner: a support inbox with "3 agents
  // online" hanging off its top-right corner. Beats: the chip rises into its
  // corner after the window has settled. Plays once; the still is the payoff.

  type S = { on: boolean }

  async function script(a: Act<S>) {
    await a.wait(600)
    a.put({ on: true })
    await a.wait(2600)
  }
</script>

<Stage
  width={520}
  height={360}
  compact={{ below: 520, width: 358, height: 360 }}
  initial={{ on: false }}
  poster={{ on: true }}
  {script}
  play="once"
  className="cc"
>
  {#snippet children(s)}
    <Window title="Support" className="cc-win">
      <div class="cc-list">
        <Row selected>
          {#snippet lead()}<Avatar name="Priya Nair" size={28} />{/snippet}
          {#snippet title()}<Text>Priya Nair</Text>{/snippet}
          {#snippet meta()}<Text>2m</Text>{/snippet}
          {#snippet subtitle()}<Text>Can I move my plan to annual billing?</Text>{/snippet}
        </Row>
        {#each [180, 150, 200, 140] as w, i (i)}
          <Row>
            {#snippet lead()}<Avatar size={28} />{/snippet}
            {#snippet title()}<Bar w={80} h={7} r={3.5} tone={3} />{/snippet}
            {#snippet meta()}<Bar w={20} h={6} r={3} tone={2} />{/snippet}
            {#snippet subtitle()}<Bar w={w} h={6} r={3} tone={2} />{/snippet}
          </Row>
        {/each}
      </div>
    </Window>
    <div class="cc-chip" data-on={s.on || undefined}>
      <Facepile names={['Ana Ruiz', 'Jon Park', 'Leo Sato']} size={20} overlap={3} />
      <Text className="cc-chip__text">3 agents online</Text>
    </div>
  {/snippet}
</Stage>
