<script lang="ts">
  import { Avatar, Bar, Row, Stage, Text, Window } from 'svelte-stageshow'
  import './static-card.css'

  // A feature card (400 x 300) with the product masked inside it: the window is
  // pinned top-left, runs off the right and bottom, and a detail card straddles
  // its left edge over the sidebar, about half outside. Real words only on the
  // selected customer, its neighbors and the total; bars everywhere else.
  const ROWS: { selected?: boolean; name?: number | string; amount?: number | string }[] = [
    { name: 'Halvorsen & Co', amount: '$1,240' },
    { selected: true },
    { name: 'Lumen Studio', amount: '$860' },
    { name: 84, amount: 38 },
    { name: 64, amount: 48 },
    { name: 78, amount: 40 },
  ]
  const NAV = ['Overview', 'Customers', 'Invoices', 'Reports']
</script>

<Stage width={400} height={300} compact={{ below: 400, width: 358, height: 300 }} className="sc-card">
  {#snippet children()}
    <Window url="dashboard.northwind.co" className="sc-window">
      <aside class="sc-sidebar">
        <Bar w={20} h={20} r={6} tone={4} style="margin-bottom:10px" />
        {#each NAV as label, i}
          <div class="sc-nav" data-on={i === 1 || undefined}>
            <Bar w={10} h={10} r={3} tone={i === 1 ? 4 : 3} />
            <Text className="sc-nav__label">{label}</Text>
          </div>
        {/each}
      </aside>
      <div class="sc-main">
        <div class="sc-header">
          <Text className="sc-title">Customers</Text>
          <Bar w={52} h={22} r={6} tone={2} />
        </div>
        <div class="sc-list">
          {#each ROWS as row, i}
            {#if row.selected}
              <Row pad={0} selected className="sc-row">
                {#snippet lead()}<Avatar name="Jackson Hot Yoga" tone="accent" size={18} />{/snippet}
                {#snippet title()}<Text className="sc-name">Jackson Hot Yoga</Text>{/snippet}
                <Bar w={40} tone={4} />
              </Row>
            {:else}
              <Row pad={0} className="sc-row">
                {#snippet lead()}<Bar w={18} h={18} r={9} tone={2} />{/snippet}
                {#snippet title()}
                  {#if typeof row.name === 'string'}<Text className="sc-rowname">{row.name}</Text>{:else}<Bar w={row.name!} tone={3} />{/if}
                {/snippet}
                {#if typeof row.amount === 'string'}<Text className="sc-rowamount">{row.amount}</Text>{:else}<Bar w={row.amount!} tone={2} />{/if}
              </Row>
            {/if}
          {/each}
        </div>
      </div>
    </Window>

    <div class="sc-detail">
      <div class="sc-detail-head">
        <Avatar name="Jackson Hot Yoga" tone="accent" size={26} className="sc-avatar-large" />
        <div class="sc-detail-who">
          <Text className="sc-detail-name">Jackson Hot Yoga</Text>
          <Bar w={64} h={5} tone={2} />
        </div>
      </div>
      {#each [48, 36] as width, i}
        <div class="sc-detail-row">
          <Bar w={width} h={5} tone={3} />
          <Bar w={width - 12} h={5} tone={2} />
        </div>
      {/each}
      <div class="sc-detail-row total">
        <Text className="sc-detail-label">Total</Text>
        <Text className="sc-detail-total">$72.00</Text>
      </div>
    </div>
  {/snippet}
</Stage>
