<script lang="ts">
  import { Badge, Field, Icon, Segmented, Stage, Text, Window } from 'svelte-stageshow'
  import './looks.css'

  // The same invitation in three product identities. Copy a look's tokens,
  // then preserve the target product's typography and density, not this UI.
  const looks = [
    ['look-default', 'Quiet workspace', 'System type · compact controls'],
    ['look-radix', 'Technical product', 'Indigo · precise borders'],
    ['look-consumer', 'Consumer app', 'Roomier controls · soft corners'],
  ] as const

  const studies = [
    { look: 'look-console', title: 'Developer console', detail: 'Dark surfaces · restrained status', kind: 'console' },
    { look: 'look-finance', title: 'Financial overview', detail: 'Tabular figures · measured hierarchy', kind: 'finance' },
    { look: 'look-canvas', title: 'Creative workspace', detail: 'Open canvas · precise selection', kind: 'canvas' },
    { look: 'look-messages', title: 'Team conversation', detail: 'Soft surfaces · comfortable rhythm', kind: 'messages' },
    { look: 'look-research', title: 'Research notebook', detail: 'Sans-serif reading · quiet structure', kind: 'research' },
    { look: 'look-dimensional', title: 'Dimensional surfaces', detail: 'Layered paper · precise lighting', kind: 'dimensional' },
  ] as const
</script>

{#snippet invitation()}
  <Window url="app.northwind.co" className="lk-window">
    <div class="lk-body">
      <div class="lk-intro">
        <div class="lk-head"><Text className="lk-title">Invite your team</Text><Badge tone="accent">3 seats</Badge></div>
        <Text className="lk-description">Choose who can access this workspace.</Text>
      </div>
      <Field label="Email address" value="ada@northwind.co" />
      <Segmented items={['Member', 'Admin', 'Guest']} value={0} />
      <div class="lk-invite">Send invitation <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 7h9M7.5 3l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg></div>
    </div>
  </Window>
{/snippet}

{#snippet studyScene(kind: string)}
  {#if kind === 'console'}
    <div class="lk-product lk-console">
      <header class="lk-product-head"><span class="lk-console-command">&gt;_</span><strong>Deployments</strong><span class="lk-console-env">production</span></header>
      <div class="lk-console-body">
        <div class="lk-console-title"><strong>account-web</strong><span><i></i>Ready</span></div>
        <div class="lk-console-commit"><code>8f2c19a</code><span>Update account settings</span></div>
        <div class="lk-console-log">
          <div><Icon name="check" size={12} /><span>Build application</span><span>5s</span></div>
          <div><Icon name="check" size={12} /><span>Run checks</span><span>2s</span></div>
          <div><Icon name="check" size={12} /><span>Publish</span><span>2s</span></div>
        </div>
        <div class="lk-console-footer"><span>Built in 9 seconds</span><span>View deployment <Icon name="external" size={13} /></span></div>
      </div>
    </div>
  {:else if kind === 'finance'}
    <div class="lk-product lk-finance">
      <header class="lk-product-head"><strong>Overview</strong><span class="lk-finance-period">This month <Icon name="chevron-down" size={12} /></span></header>
      <div class="lk-finance-body">
        <div class="lk-finance-label">Total balance</div>
        <div class="lk-finance-balance">$48,250<span>.00</span></div>
        <div class="lk-finance-trend">+4.8% <span>from last month</span></div>
        <svg class="lk-finance-chart" viewBox="0 0 276 60" role="img" aria-label="Balance increased steadily during the month">
          <path class="lk-finance-grid" d="M0 52.5H276M0 24.5H276" />
          <path class="lk-finance-area" d="M0 49C14 49 15 44 28 45S42 37 55 39S68 42 82 34S97 35 110 29S125 32 138 25S152 28 166 20S179 23 193 16S207 18 221 11S235 15 248 7S263 9 276 3V60H0Z" />
          <path class="lk-finance-line" d="M0 49C14 49 15 44 28 45S42 37 55 39S68 42 82 34S97 35 110 29S125 32 138 25S152 28 166 20S179 23 193 16S207 18 221 11S235 15 248 7S263 9 276 3" />
        </svg>
        <div class="lk-finance-account"><span class="lk-finance-account-icon"><Icon name="card" size={15} /></span><span>Operating<span>•• 4829</span></span><strong>$36,250.00</strong></div>
        <div class="lk-finance-account"><span class="lk-finance-account-icon"><Icon name="lock" size={15} /></span><span>Reserve<span>•• 9012</span></span><strong>$12,000.00</strong></div>
      </div>
    </div>
  {:else if kind === 'canvas'}
    <div class="lk-product lk-canvas">
      <header class="lk-product-head"><strong>Untitled canvas</strong><span>100% <Icon name="chevron-down" size={12} /></span></header>
      <div class="lk-canvas-workspace">
        <div class="lk-canvas-tools" aria-hidden="true"><span class="lk-canvas-tool-selected"><svg viewBox="0 0 16 16"><path d="m4 2 9 6-5 1-2 4Z" /></svg></span><span><svg viewBox="0 0 16 16"><rect x="3" y="3" width="10" height="10" rx="1" /></svg></span><span class="lk-canvas-type">T</span></div>
        <div class="lk-canvas-art" aria-label="Selected blue geometric poster">
          <div class="lk-canvas-art-title">A new<br />perspective.</div>
          <svg class="lk-canvas-shape" viewBox="0 0 160 110" aria-hidden="true"><path d="M14 94 71 8 137 94Z" /><path d="m48 94 39-61 47 61" /></svg>
          <span class="lk-canvas-art-footer">FORM / 01</span>
          <i></i><i></i><i></i><i></i>
        </div>
        <span class="lk-canvas-size">152 × 184</span>
        <div class="lk-canvas-properties"><span><i></i>Fill</span><strong>#2E55CC</strong><span>100%</span></div>
      </div>
    </div>
  {:else if kind === 'messages'}
    <div class="lk-product lk-messages">
      <header class="lk-product-head"><span class="lk-message-avatar">AL</span><span class="lk-message-person"><strong>Alex Lee</strong><span>Design team</span></span><Icon name="more" size={16} /></header>
      <div class="lk-message-thread">
        <div class="lk-message-time">Today, 10:42</div>
        <div class="lk-message-in">The new cover is ready.<br />What do you think?</div>
        <div class="lk-message-file"><span><Icon name="file" size={17} /></span><span><strong>Cover exploration.pdf</strong><small>2 pages · 1.4 MB</small></span></div>
        <div class="lk-message-out">This is the one. Let’s share it.</div>
        <div class="lk-message-read">Seen <Icon name="check" size={11} /></div>
      </div>
      <div class="lk-message-composer"><Icon name="plus" size={15} /><span>Write a message…</span><span class="lk-message-send"><Icon name="arrow" size={13} /></span></div>
    </div>
  {:else if kind === 'research'}
    <div class="lk-product lk-research">
      <header class="lk-product-head"><Icon name="file" size={14} /><span>Research / Field notes</span><Icon name="more" size={16} /></header>
      <div class="lk-research-body">
        <div class="lk-research-kicker">PRODUCT RESEARCH <span>06</span></div>
        <div class="lk-research-title">Make room<br />for the first idea.</div>
        <p>The best tools get out of the way.<br />Start with space, then add structure.</p>
        <div class="lk-research-note"><span>01</span><div><strong>A quieter starting point</strong><p>Less setup. More time to explore.</p></div></div>
        <div class="lk-research-source"><span>Interview notes</span><span>4 sources <Icon name="arrow" size={12} /></span></div>
      </div>
    </div>
  {:else}
    <div class="lk-transfer-frame">
      <div class="lk-transfer-paper">
        <header class="lk-transfer-head">
          <span class="lk-transfer-symbol" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M4 7h12m-3-3 3 3-3 3M16 13H4m3-3-3 3 3 3" /></svg></span>
          <span>Bank transfer</span><span class="lk-transfer-id">TR–1048</span>
        </header>
        <div class="lk-transfer-amount"><span>Amount sent</span><strong>$2,400<span>.00</span></strong><span>USD · No transfer fee</span></div>
        <dl class="lk-transfer-details">
          <div><dt>From</dt><dd>Operating <span>•• 1842</span></dd></div>
          <div><dt>To</dt><dd>Avery Studio</dd></div>
          <div><dt>Reference</dt><dd>October services</dd></div>
        </dl>
      </div>
      <footer class="lk-transfer-status"><span class="lk-transfer-check" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="m4 8 2.5 2.5L12 5" /></svg></span><span>Transfer complete</span><span class="lk-transfer-date">Oct 24</span></footer>
    </div>
  {/if}
{/snippet}

<div class="lk-pair">
  {#each looks as [look, title, detail] (look)}
    <figure class={look}>
      <Stage specimen width={358} height={360} compact={{ below: 358, width: 288, height: 360 }} initial={{}}>
        {#snippet children()}{@render invitation()}{/snippet}
      </Stage>
      <figcaption><strong>{title}</strong><span>{detail}</span></figcaption>
    </figure>
  {/each}
  {#each studies as study (study.look)}
    <figure class={study.look}>
      <Stage width={358} height={360} compact={{ below: 358, width: 288, height: 360 }} greys="cool" theme={study.look === 'look-console' ? 'dark' : 'light'}>
        {#snippet children()}{@render studyScene(study.kind)}{/snippet}
      </Stage>
      <figcaption><strong>{study.title}</strong><span>{study.detail}</span></figcaption>
    </figure>
  {/each}
</div>
