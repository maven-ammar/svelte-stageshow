<script lang="ts">
  import { Chart, Icon, Meter, Stage, Text, type Act } from 'svelte-stageshow'
  import './stacked-cards.css'

  type S = { on: boolean }

  const BARS = [8, 12, 9, 15, 13, 18, 11, 17, 22, 16, 20, 26, 21, 29, 24, 31, 27, 34]

  async function script(a: Act<S>) {
    await a.wait(500)
    a.put({ on: true })
    // The last bar starts at 374ms and takes 700ms; this mark fires after the
    // stack has settled, so the gate scores the finished chart, not a stagger.
    await a.wait(1200)
    a.mark('settled')
    await a.wait(1800)
  }
</script>

<Stage
  width={520}
  height={400}
  compact={{ below: 520, width: 358, height: 400 }}
  initial={{ on: false }}
  poster={{ on: true }}
  {script}
  play="once"
  className="sk"
>
  {#snippet children(s, _rect, layout)}
    <div class="sk-stack">
      <section class="sk-card">
        <div class="sk-plan">
          <span class="sk-mark"><Icon name="bolt" size={14} /></span>
          <div class="sk-who">
            <Text className="sk-name">Pro plan</Text>
            <Text className="sk-sub">$49 per month</Text>
          </div>
        </div>
        <div class="sk-usage">
          <Text className="sk-label">API calls</Text>
          <Text className="sk-value">4.2M of 5M</Text>
        </div>
        <Meter value={s.on ? 0.84 : 0} />
      </section>
      <section class="sk-card">
        <Text className="sk-label">Calls, last 18 days</Text>
        <Chart kind="bars" className="sk-chart" data={BARS} width={layout === 'compact' ? 286 : 300} height={140} show={s.on} />
      </section>
    </div>
  {/snippet}
</Stage>
