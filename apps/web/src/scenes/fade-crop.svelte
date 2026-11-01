<script lang="ts">
  import { Badge, Bar, Row, Stage, Text, Window } from 'svelte-stageshow'
  import './fade-crop.css'

  // A fade crop: a deployments page that sinks into the page instead of
  // running off an edge. A still. Only the foot fades; it's a mask, not a
  // color laid over the foot.

  const ROWS = [
    { status: 'Ready', branch: 'main', commit: 'Fix checkout redirect loop', age: '2m ago', tone: 'success' as const },
    { status: 'Ready', branch: 'pricing-copy', commit: 'New annual plan wording', age: '1h ago', tone: 'success' as const },
  ]

  const FILL = [
    [132, 168],
    [96, 140],
    [148, 120],
    [110, 176],
  ]
</script>

<Stage width={640} height={360} compact={{ below: 600, width: 358, height: 360 }} className="fc">
  {#snippet children()}
    <div class="fc-mask">
      <Window url="deploy.northwind.co" className="fc-win">
        <div class="fc-body">
          <div class="fc-head">
            <Text className="fc-title">Deployments</Text>
            <Bar w={84} h={22} r={6} tone={1} />
          </div>
          <div class="fc-list">
            {#each ROWS as r (r.commit)}
              <Row pad={0} className="fc-row">
                {#snippet lead()}<Badge tone={r.tone} dot>{r.status}</Badge>{/snippet}
                {#snippet title()}<Text className="fc-commit">{r.commit}</Text>{/snippet}
                {#snippet subtitle()}<Text className="fc-branch">{r.branch}</Text>{/snippet}
                {#snippet meta()}<Text className="fc-age">{r.age}</Text>{/snippet}
              </Row>
            {/each}
            {#each FILL as [a, b], i (i)}
              <Row pad={0} className="fc-row">
                {#snippet lead()}<Bar w={52} h={20} r={10} tone={1} />{/snippet}
                {#snippet title()}<Bar w={a} h={8} r={4} tone={3} />{/snippet}
                {#snippet subtitle()}<Bar w={b * 0.5} h={7} r={3.5} tone={2} />{/snippet}
                {#snippet meta()}<Bar w={40} h={7} r={3.5} tone={2} />{/snippet}
              </Row>
            {/each}
          </div>
        </div>
      </Window>
    </div>
  {/snippet}
</Stage>
