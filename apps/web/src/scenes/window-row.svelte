<script lang="ts">
  import { Badge, Bar, Check, Row, Stage, States, Text, Window, type Act } from 'svelte-stageshow'
  import './window-row.css'

  type S = { done: number; ready: boolean }

  const initial: S = { done: 0, ready: false }
  const poster: S = { done: 4, ready: true }

  const STEPS = ['Read the auth middleware', 'Found the redirect loop', 'Patched the session check', 'Tests passing, 48 of 48']

  async function script(a: Act<S>) {
    await a.wait(900)
    for (let i = 1; i <= STEPS.length; i++) {
      a.mark(`step-${i}`)
      a.put({ done: i })
      await a.wait(i === STEPS.length ? 700 : 950)
    }
    a.mark('ready')
    a.put({ ready: true })
    await a.wait(2400)
  }
</script>

{#snippet workingState()}
  <Badge tone="neutral">Working</Badge>
{/snippet}

{#snippet readyState()}
  <Badge tone="success">Ready for review</Badge>
{/snippet}

{#snippet busy(rows: number[])}
  <div class="wr-body">
    {#each rows as w, i}
      <Row pad={0}>
        {#snippet lead()}<Check on={i < rows.length - 1} pending={i === rows.length - 1} />{/snippet}
        {#snippet title()}<Bar w={w} h={7} r={3.5} tone={i < rows.length - 1 ? 3 : 2} />{/snippet}
      </Row>
    {/each}
  </div>
{/snippet}

<Stage
  width={720}
  height={300}
  compact={{ below: 600, width: 358, height: 300 }}
  {initial}
  {poster}
  {script}
  play="once"
  className="wr"
>
  {#snippet children(s)}
    <Window lights="grey" className="wr-win wr-win--left">
      {@render busy([150, 120, 170])}
    </Window>
    <Window title="login-redirect" className="wr-win wr-win--hero">
      <div class="wr-body">
        <!-- One Check per step, mounted throughout: ring, then pending, then
             done, so each hand-over is the kit's own animation -->
        {#each STEPS as step, i (step)}
          <Row pad={0} className="wr-step" data-on={i < s.done || undefined} data-next={i === s.done || undefined}>
            {#snippet lead()}<Check on={i < s.done} pending={i === s.done} />{/snippet}
            {#snippet title()}<Text className="wr-label">{step}</Text>{/snippet}
          </Row>
        {/each}
        <div class="wr-foot">
          <States
            value={s.ready ? 'ready' : 'working'}
            align="start"
            states={{ working: workingState, ready: readyState }}
          />
        </div>
      </div>
    </Window>
    <Window lights="grey" className="wr-win wr-win--right">
      {@render busy([130, 160, 110, 140])}
    </Window>
  {/snippet}
</Stage>
