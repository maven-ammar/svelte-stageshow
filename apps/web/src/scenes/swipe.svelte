<script lang="ts">
  import { Avatar, Bar, Collapse, Phone, Row, Stage, type Act } from 'svelte-stageshow'
  import './swipe.css'

  type S = { dx: number; throw: { ms: number; ease: string } | null; gone: boolean }

  const initial: S = { dx: 0, throw: null, gone: false }

  const PICK = 0

  const MAIL = [
    { from: 'Northwind Air', time: '9:12', subject: 'Your trip to Lisbon', preview: 'Check-in opens 24 hours before departure. Your seat is 14A.', unread: true },
    { from: 'Jon Park', time: '8:30', subject: 'Re: pricing page', preview: 'Looks good to me. One note on the annual toggle copy.', unread: false },
    { from: 'Maya Chen', time: '9:41', subject: 'Launch checklist', preview: 'Two things left before Thursday: the pricing page and the press kit.', unread: false },
    { from: 'Ana Ruiz', time: 'Yesterday', subject: 'Q3 board deck', preview: 'Draft is in the shared folder, comments welcome by Friday.', unread: false },
    { from: 'Leo Sato', time: 'Yesterday', subject: 'Offsite dates', preview: 'Can everyone do the week of the 14th? Venue is holding it.', unread: false },
  ]

  async function script(a: Act<S>) {
    await a.wait(900)

    // 1. Press the message on its right side, then swipe it left
    a.mark('swipe')
    const row = a.rect('row')
    const y = row.y + row.height * 0.5
    await a.move({ x: row.x + row.width * 0.8, y })
    await a.wait(250)
    const from = row.x + row.width * 0.8
    const samples: { x: number; t: number }[] = []
    await a.drag(
      { x: row.x + row.width * 0.22, y },
      (at) => {
        samples.push({ x: at.x, t: performance.now() })
        a.put({ dx: at.x - from })
      },
      // A swipe is flat: no carrying bow, the finger runs along the row
      { duration: 300, path: (t, a0, b0) => ({ x: a0.x + (b0.x - a0.x) * t, y: a0.y }) },
    )

    // 2. The finger lifts still moving; the row carries on at that speed
    a.mark('throw')
    const last = samples.slice(-4)
    const v = last.length > 1 ? Math.abs(last[last.length - 1]!.x - last[0]!.x) / Math.max(1, last[last.length - 1]!.t - last[0]!.t) : 1
    const dx = samples.length ? samples[samples.length - 1]!.x - from : 0
    const left = row.width + dx
    const ms = 300
    // A curve whose first slope is the finger's speed, easing out at the end
    const x1 = 0.25
    const y1 = Math.min(0.95, (x1 * v * ms) / left)
    a.put({ throw: { ms, ease: `cubic-bezier(${x1}, ${y1.toFixed(3)}, 0.35, 1)` }, dx: -row.width })
    await a.wait(ms)

    // 3. The gap closes and the next message moves up
    a.mark('close')
    a.put({ gone: true })
    await a.wait(1800)
    a.mark('done')
  }

  // Placeholder rows: bars at a real message's line heights, so every row is
  // the height a real one would be. Only the swiped message has words.
  const FILL = [
    null,
    null,
    { from: 104, subject: 148, preview: [250, 170] },
    { from: 92, subject: 136, preview: [256, 180] },
    { from: 84, subject: 112, preview: [230, 140] },
  ]
</script>

{#snippet chevronLeft(size: number, strokeWidth: number)}
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={strokeWidth} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="m15 18-6-6 6-6" />
  </svg>
{/snippet}

{#snippet chevronRight(size: number, strokeWidth: number)}
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={strokeWidth} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="m9 18 6-6-6-6" />
  </svg>
{/snippet}

{#snippet ellipsis(size: number, strokeWidth: number)}
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={strokeWidth} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
{/snippet}

{#snippet userIcon(size: number, strokeWidth: number)}
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={strokeWidth} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
{/snippet}

{#snippet cartIcon(size: number, strokeWidth: number)}
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={strokeWidth} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
{/snippet}

{#snippet megaphoneIcon(size: number, strokeWidth: number)}
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={strokeWidth} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="m3 11 18-5v12L3 14v-3z" />
    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
  </svg>
{/snippet}

{#snippet messageIcon(size: number, strokeWidth: number)}
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={strokeWidth} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
{/snippet}

{#snippet archiveIcon(size: number, strokeWidth: number)}
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={strokeWidth} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect width="20" height="5" x="2" y="3" rx="1" />
    <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
    <path d="M10 12h4" />
  </svg>
{/snippet}

<Stage
  width={400}
  height={480}
  compact={{ below: 400, width: 358, height: 480 }}
  {initial}
  poster={{ dx: 0, throw: null, gone: true }}
  {script}
  play="once"
  cursor={{ at: { x: 330, y: 470 }, style: 'touch' }}
  className="sw"
>
  {#snippet children(s, rect, layout)}
    {@const box = rect('row')}
    {@const k = box.width ? box.width / 402 : 1}
    {@const shift = s.dx / k}
    {@const open = Math.max(0, -shift)}

    {#snippet cell(m: (typeof MAIL)[number], i: number, picked: boolean)}
      {@const real = picked || i === PICK + 1}
      <div class="sw-cell" data-target={picked ? 'row' : undefined}>
        <!-- Only while the row is off its rest: at rest its antialiased edges would show a purple hairline -->
        {#if picked && (s.dx !== 0 || s.throw)}<div class="sw-action"></div>{/if}
        {#if real}
          <Row
            pad={0}
            className="sw-row"
            unread={m.unread}
            style={picked
              ? `transform:translateX(${shift}px);transition:${s.throw ? `transform ${s.throw.ms}ms ${s.throw.ease}` : 'none'}`
              : ''}
          >
            {#snippet lead()}
              {#if picked || i === PICK + 1}
                <Avatar name={m.from} tone="ios" size={40} />
              {:else}
                <Avatar size={40} />
              {/if}
            {/snippet}
            {#snippet title()}
              {#if picked || i === PICK + 1}
                {m.from}
              {:else}
                <Bar w={FILL[i]!.from} h={11} r={5.5} tone={4} />
              {/if}
            {/snippet}
            {#snippet meta()}
              {#if picked || i === PICK + 1}
                <span class="sw-time">
                  {m.time}
                  {@render chevronRight(14, 2.25)}
                </span>
              {:else}
                <Bar w={34} h={9} r={4.5} tone={2} />
              {/if}
            {/snippet}
            {#snippet subtitle()}
              {#if picked || i === PICK + 1}
                <span class="sw-subject">{m.subject}</span>
              {:else}
                <Bar w={FILL[i]!.subject} h={9} r={4.5} tone={3} />
              {/if}
            {/snippet}
            {#snippet preview()}{m.preview}{/snippet}
            {#if picked}
              <span
                class="sw-action__mark"
                style={`opacity:${s.gone ? 0 : Math.min(1, open / 60)};transition:${s.gone ? 'opacity 120ms ease-out' : 'none'}`}
              >
                {@render archiveIcon(22, 2)}
                Archive
              </span>
            {/if}
          </Row>
        {:else}
          <Row
            pad={0}
            className="sw-row"
            unread={m.unread}
          >
            {#snippet lead()}<Avatar size={40} />{/snippet}
            {#snippet title()}<Bar w={FILL[i]!.from} h={11} r={5.5} tone={4} />{/snippet}
            {#snippet meta()}<Bar w={34} h={9} r={4.5} tone={2} />{/snippet}
            {#snippet subtitle()}<Bar w={FILL[i]!.subject} h={9} r={4.5} tone={3} />{/snippet}
            {#snippet preview()}
              {#each FILL[i]!.preview as w}
                <span class="sw-fill"><Bar w={w} h={9} r={4.5} tone={2} /></span>
              {/each}
            {/snippet}
          </Row>
        {/if}
      </div>
    {/snippet}

    <Phone width={layout === 'compact' ? 340 : 380} className="sw-phone">
      <div class="sw-app">
        <header class="sw-head">
          <div class="sw-bar-top">
            <span class="sw-round">{@render chevronLeft(20, 2.25)}</span>
            <span class="sw-round">{@render ellipsis(18, 2.25)}</span>
          </div>
          <div class="sw-title">Inbox</div>
          <div class="sw-cats">
            <span class="sw-cat" data-on>
              {@render userIcon(15, 2.25)}
              Primary
            </span>
            <span class="sw-cat">{@render cartIcon(16, 2)}</span>
            <span class="sw-cat">{@render megaphoneIcon(16, 2)}</span>
            <span class="sw-cat">{@render messageIcon(16, 2)}</span>
          </div>
        </header>
        <div class="sw-list">
          {#each MAIL as m, i (m.from)}
            {@const picked = i === PICK}
            {#if picked}
              <Collapse open={!s.gone} solid>
                {@render cell(m, i, true)}
              </Collapse>
            {:else}
              <div>{@render cell(m, i, false)}</div>
            {/if}
          {/each}
        </div>
      </div>
    </Phone>
  {/snippet}
</Stage>
