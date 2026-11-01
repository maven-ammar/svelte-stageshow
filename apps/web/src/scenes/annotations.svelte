<script lang="ts">
  import { Connector, Follow, Icon, Stage, States } from 'svelte-stageshow'
  import type { Act, Rect } from 'svelte-stageshow'
  import './annotations.css'

  const lakePhoto = new URL('../assets/kawaguchiko.jpg', import.meta.url).href

  const studies = [
    { id: 'collect', title: 'Usage into an invoice', note: 'Connect three usage sources to one invoice. Blue dots keep flowing after its first update; a matching shared delivery shows where those inputs meet.' },
    { id: 'detail', title: 'A payout and its detail', note: 'Select one payout. A dotted link opens its settlement; a quieter solid leader explains arrival without replacing the product view.' },
    { id: 'chart', title: 'A chart point', note: 'Select one result. The leader joins the measured point to its explanation, then leaves when the selection clears.' },
    { id: 'measure', title: 'Selection guides', note: 'Resize a card by its handle. Its guides and dimensions belong to the same box, including on the return drag.' },
    { id: 'flow', title: 'A request and its reply', note: 'Send a billing event. The solid request points out; the dashed acknowledgement returns only after the receipt arrives.' },
    { id: 'branch', title: 'A shared processing graph', note: 'Store one asset, then send it along a shared trunk to three jobs. Each branch meets its destination cleanly; Clear jobs dismisses the result.' },
    { id: 'stream', title: 'An ongoing event stream', note: 'Connect the feed once. A quiet route stays fixed while moving dashes show events arriving in the activity table; reduced motion keeps its direction visible.' },
    { id: 'follow', title: 'Following a layer', note: 'Arrange a selected layer. Its annotation travels and resizes with the object, then fades intact when selection clears.' },
  ] as const
  type Study = typeof studies[number]['id']
  const initialStudy = (): Study => {
    const value = typeof window === 'undefined' ? null : new URL(window.location.href).searchParams.get('annotation')
    return studies.find((study) => study.id === value)?.id ?? 'collect'
  }
  const point = (r: Rect) => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 })

  const uid = $props.id()
  const cleanUid = uid.replace(/:/g, '')
  const pickerId = `an-study-${cleanUid}`
  const revealId = `an-stream-${cleanUid}`

  let selected = $state<Study>(initialStudy())
  let revision = $state(0)
  let hostWidth = $state(0)
  const width = $derived(hostWidth > 0 ? Math.min(600, Math.floor(hostWidth)) : null)
  const active = $derived(studies.find((study) => study.id === selected)!)

  function selectStudy(value: Study) {
    selected = value
    const url = new URL(location.href)
    url.searchParams.set('annotation', value)
    history.replaceState(null, '', url)
    if (parent !== window) parent.postMessage({ type: 'stageshow:status', annotation: value }, location.origin)
  }

  type ChartState = { selected: boolean }
  async function chartScript(a: Act<ChartState>) {
    a.mark('start'); await a.wait(650)
    await a.move('point'); await a.click(); a.mark('callout')
    await a.set({ selected: true }); await a.move('chart-rest', { duration: 360 }); await a.wait(2440)
    await a.click(); a.mark('clear')
    await a.set({ selected: false }); await a.wait(700); a.mark('done')
    await a.wait(700)
  }

  type MeasureState = { selected: boolean; width: number; height: number }
  function measureScriptFor(compact: boolean) {
    const start = { width: compact ? 168 : 256, height: compact ? 136 : 150 }
    const finish = { width: compact ? 188 : 304, height: compact ? 160 : 180 }
    return async (a: Act<MeasureState>) => {
      a.mark('start'); await a.wait(650); await a.move('measure-card'); await a.click()
      await a.set({ selected: true }); await a.wait(500)
      await a.move('resize'); const from = a.center('resize'); a.mark('resize')
      await a.drag({ x: from.x + finish.width - start.width, y: from.y + finish.height - start.height }, (p, origin) => a.put({ width: start.width + p.x - origin.x, height: start.height + p.y - origin.y }), { duration: 1400 })
      await a.set(finish); await a.wait(2100)
      await a.move('resize'); const back = a.center('resize'); a.mark('restore')
      await a.drag({ x: back.x - finish.width + start.width, y: back.y - finish.height + start.height }, (p, origin) => a.put({ width: finish.width + p.x - origin.x, height: finish.height + p.y - origin.y }), { duration: 1400 })
      await a.set(start); await a.move('measure-rest'); await a.click()
      await a.set({ selected: false }); await a.wait(650); a.mark('done'); await a.wait(650)
    }
  }
  const measureScriptWide = measureScriptFor(false)
  const measureScriptCompact = measureScriptFor(true)

  type FlowState = { step: number }
  async function flowScript(a: Act<FlowState>) {
    a.mark('start'); await a.wait(650); await a.move({ at: 'send', x: .92, y: .85 }); await a.click()
    a.mark('request'); await a.set({ step: 1 })
    await a.move('flow-rest', { duration: 350 }); await a.wait(1050)
    a.mark('reply'); await a.set({ step: 2 }); await a.wait(1100)
    a.mark('acknowledged'); await a.set({ step: 3 }); await a.wait(2200)
    await a.move('clear-trace'); await a.click(); a.mark('clear')
    await a.set({ step: 0 }); await a.wait(750); a.mark('done'); await a.wait(650)
  }

  type FollowState = { selected: boolean; arranged: boolean }
  async function followScript(a: Act<FollowState>) {
    a.mark('start'); await a.wait(650); await a.move('layer'); await a.click()
    await a.set({ selected: true }); await a.wait(1000)
    await a.move('arrange'); await a.click(); a.mark('arrange')
    await a.set({ arranged: true }); await a.wait(2600)
    await a.move('restore'); await a.click(); a.mark('restore')
    await a.set({ arranged: false }); await a.wait(1400)
    await a.move('follow-rest'); await a.click(); a.mark('clear')
    await a.set({ selected: false }); await a.wait(650); a.mark('done'); await a.wait(650)
  }

  type BranchState = { phase: number; clearing: boolean }
  async function branchScript(a: Act<BranchState>) {
    a.mark('start'); await a.wait(650); await a.move({ at: 'process-asset', x: .92, y: .85 }); await a.click()
    a.mark('upload'); await a.set({ phase: 1 })
    await a.move('graph-rest', { duration: 350 }); await a.wait(750)
    a.mark('spine'); await a.set({ phase: 2 }); await a.wait(1100)
    a.mark('branches'); await a.set({ phase: 3 }); await a.wait(1100)
    a.mark('ready'); await a.set({ phase: 4 }); await a.wait(2300)
    await a.move('clear-jobs'); await a.click(); a.mark('clear')
    await a.set({ clearing: true }); await a.wait(350)
    await a.set({ phase: 0, clearing: false }); await a.wait(700); a.mark('done'); await a.wait(650)
  }

  const STREAM_REVEAL_MS = 700
  type StreamState = { connected: boolean; receiving: boolean }
  async function streamScript(a: Act<StreamState>) {
    a.mark('start'); await a.wait(800); await a.move({ at: 'connect-stream', x: .92, y: .85 }); await a.click()
    a.mark('connected'); await a.set({ connected: true })
    await a.move('stream-rest', { duration: 350 }); await a.wait(STREAM_REVEAL_MS + 100 - 350)
    a.mark('live'); await a.set({ receiving: true }); await a.wait(800)
    await a.wait(2250)
    // The connection stays open. Only the line's phase continues; there is no
    // polling script or invisible reset of the successful connection.
    await a.wait(800); a.mark('done')
  }

  type Collection = { phase: number }
  async function collectUsage(a: Act<Collection>) {
    a.mark('start'); await a.wait(850)
    await a.move({ at: 'sync-usage', x: .92, y: .85 }); await a.click()
    a.mark('collect'); await a.set({ phase: 1 })
    await a.move('usage-rest', { duration: 350 }); await a.wait(750)
    a.mark('post'); await a.set({ phase: 2 }); await a.wait(1100)
    a.mark('invoice'); await a.set({ phase: 3 })
    await a.wait(3050); a.mark('done')
    // The first invoice update is complete; its three live sources stay connected.
  }

  type Detail = { phase: number; selected: boolean; clearing: boolean }
  async function inspectPayout(a: Act<Detail>) {
    a.mark('start'); await a.wait(850)
    await a.move({ at: 'payout-row', x: .2, y: .5 }); await a.click()
    a.mark('link'); await a.set({ selected: true, phase: 1 })
    await a.move('payout-rest', { duration: 350 }); await a.wait(750)
    a.mark('detail'); await a.set({ phase: 2 }); await a.wait(920)
    a.mark('leader'); await a.set({ phase: 3 }); await a.wait(1100)
    a.mark('explanation'); await a.set({ phase: 4 }); await a.wait(2300)
    await a.move('clear-payout'); await a.click(); a.mark('clear')
    await a.set({ clearing: true }); await a.wait(400)
    await a.set({ selected: false, clearing: false, phase: 0 }); await a.wait(600); a.mark('done')
  }

  function arrivedWhenDrawn(node: SVGElement, show: boolean) {
    const line = node.querySelector<SVGPathElement>('.ss-connector__line')
    let raf = 0
    let timer: ReturnType<typeof setTimeout> | number | undefined = undefined
    const check = () => {
      if (!show || !line) return
      const offset = parseFloat(getComputedStyle(line).strokeDashoffset || '0')
      if (Math.abs(offset) < 0.0001) node.setAttribute('data-arrived', '')
    }
    const finish = (event: Event) => {
      if (event.target === line && (event as TransitionEvent).propertyName === 'stroke-dashoffset') check()
    }
    const start = (on: boolean) => {
      node.removeAttribute('data-arrived')
      cancelAnimationFrame(raf)
      window.clearTimeout(timer)
      line?.removeEventListener('transitionend', finish)
      line?.removeEventListener('transitioncancel', finish)
      if (!on) return
      raf = requestAnimationFrame(check)
      timer = window.setTimeout(check, 1100)
      line?.addEventListener('transitionend', finish)
      line?.addEventListener('transitioncancel', finish)
    }
    start(show)
    return {
      update(next: boolean) { start(next) },
      destroy() {
        cancelAnimationFrame(raf)
        window.clearTimeout(timer)
        line?.removeEventListener('transitionend', finish)
        line?.removeEventListener('transitioncancel', finish)
      },
    }
  }
</script>

{#snippet chartStudy(w: number)}
  <Stage width={w} height={w < 480 ? 420 : 380} initial={{ selected: false }} poster={{ selected: true }} script={chartScript} cursor={{ at: { x: 25, y: 340 } }} greys="cool" accent="#5375c8" className={`an-study an-chart${w < 480 ? ' an-chart--compact' : ''}`}>
    {#snippet children(s, rect)}
      {@const p = rect('point')}
      {@const note = rect('chart-note')}
      <section class="an-chart-panel" aria-label="API usage chart">
        <header class="an-product-head"><strong>API requests</strong><span>Last 7 days <Icon name="chevron-down" size={11} /></span></header>
        <div class="an-chart-total">8,642 <span>this week</span></div>
        <div class="an-chart-note" data-target="chart-note" data-visible={s.selected || undefined}><strong>Release v2</strong><span>1,840 requests</span></div>
        <div class="an-plot">
          <svg viewBox="0 0 400 140" preserveAspectRatio="none" aria-hidden="true">
            <path class="an-chart-grid" d="M0 25H400M0 70H400M0 115H400" />
            <path class="an-chart-area" d="M0 112L44 104L87 108L130 80L174 88L217 60L260 30L304 56L348 46L400 20V140H0Z" />
            <path class="an-chart-line" d="M0 112L44 104L87 108L130 80L174 88L217 60L260 30L304 56L348 46L400 20" />
          </svg>
          <span class="an-chart-point" data-target="point" data-cursor="hand" data-selected={s.selected || undefined}></span>
        </div>
        <div class="an-chart-axis"><span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span></div>
        <span class="an-chart-rest" data-target="chart-rest"></span>
      </section>
      <!-- Meet the bottom edge vertically. A vertical-first elbow would
          finish horizontally along the note's border. -->
      <Connector class="an-chart-leader" from={point(p)} to={{ x: note.x + note.width / 2, y: note.y + note.height }} route="h" dots="none" show={s.selected && p.width > 0 && note.width > 0} />
    {/snippet}
  </Stage>
{/snippet}

{#snippet measureStudy(w: number)}
  {@const compact = w < 480}
  {@const start = { width: compact ? 168 : 256, height: compact ? 136 : 150 }}
  {@const finish = { width: compact ? 188 : 304, height: compact ? 160 : 180 }}
  {@const x = compact ? w < 330 ? 36 + (w - 288) / 2 : Math.max(36, Math.round((w - finish.width - 48) / 2)) : (w - finish.width) / 2 - 14}
  {#key compact}
    <Stage width={w} height={compact ? 420 : 380} initial={{ selected: false, ...start }} poster={{ selected: true, ...finish }} script={compact ? measureScriptCompact : measureScriptWide} cursor={{ at: { x: w - 30, y: 340 } }} greys="cool" accent="#6979c9" className={`an-study an-measure${w < 330 ? ' an-measure--narrow' : ''}`}>
      {#snippet children(s)}
        <div class="an-canvas-panel"><header class="an-product-head"><strong>Board layout</strong><span>Project card</span></header><span class="an-canvas-rest" data-target="measure-rest"></span></div>
        <div class="an-selection" data-selected={s.selected || undefined} style={`left:${x}px;top:${compact ? 137 : 112}px;width:${s.width}px;height:${s.height}px`}>
          <div class="an-design-card" data-target="measure-card" data-cursor="hand"><div><span class="an-card-project">Website refresh</span><strong>Release checklist</strong></div><div class="an-card-completion"><strong>6<span> / 8</span></strong><span>tasks complete</span></div><div class="an-card-bottom"><div class="an-card-progress"><i></i></div><footer><span>Design team</span><time>Oct 28</time></footer></div></div>
          <div class="an-selection-ring"></div><span class="an-resize-handle" data-target="resize" data-cursor="crosshair"></span>
          <div class="an-width-guide"><span>{Math.round(s.width)} px</span></div>
          <div class="an-height-guide"><span>{Math.round(s.height)}</span></div>
          <span class="an-layer-label">Project</span>
        </div>
      {/snippet}
    </Stage>
  {/key}
{/snippet}

{#snippet flowStudy(w: number)}
  {@const compact = w < 480}
  <Stage width={w} height={compact ? 496 : 330} initial={{ step: 0 }} poster={{ step: 3 }} script={flowScript} cursor={{ at: { x: 25, y: compact ? 360 : 270 } }} greys="cool" accent="#468575" className={`an-study an-flow${compact ? ' an-flow--compact' : ''}`}>
    {#snippet children(s, rect)}
      {@const a = rect('billing')}
      {@const b = rect('workspace')}
      {@const from = compact ? { x: a.x + a.width / 2 - 28, y: a.y + a.height } : { x: a.x + a.width, y: a.y + a.height / 2 - 18 }}
      {@const to = compact ? { x: b.x + b.width / 2 - 28, y: b.y } : { x: b.x, y: b.y + b.height / 2 - 18 }}
      {@const backFrom = compact ? { x: to.x + 56, y: to.y } : { x: to.x, y: to.y + 40 }}
      {@const backTo = compact ? { x: from.x + 56, y: from.y } : { x: from.x, y: from.y + 40 }}
      <header class="an-flow-title"><strong>Webhook delivery</strong><span data-target="clear-trace" data-cursor="hand">Clear trace</span></header>
      <section class="an-flow-node an-flow-source" data-target="billing" style={compact ? `left:32px;top:68px;width:${w - 64}px` : 'left:32px;top:90px;width:220px'}>
        <div class="an-node-name"><strong>Invoice paid</strong><span class="an-event-kind">Event</span></div><code>invoice.paid</code>
        <div class="an-event-record"><span>Invoice <b>0084</b></span><strong>$189.00</strong></div>
        <footer class="an-event-footer"><span>Today, 14:32</span><div class="an-send" data-target="send" data-cursor="hand"><States value={String(s.step)} states={{ 0: 'Send event', 1: 'Sending…', 2: 'Awaiting reply', 3: 'Delivered' }} /></div></footer>
      </section>
      <section class="an-flow-node an-flow-destination" data-target="workspace" data-received={s.step >= 2 || undefined} style={compact ? `left:32px;top:330px;width:${w - 64}px` : `left:${w - 196}px;top:115px;width:164px`}>
        <div class="an-node-name"><Icon name="bell" size={13} /><strong>Activity</strong></div><span class="an-endpoint">Billing notifications</span>
        <div class="an-receipt"><States align="start" value={s.step >= 2 ? 'received' : 'waiting'} states={{ waiting: 'Waiting for event', received: 'Payment received' }} /></div><div class="an-receipt-amount" data-visible={s.step >= 2 || undefined}>$189.00 <span>Invoice 0084</span></div>
      </section>
      <Connector class="an-request" from={from} to={to} route="straight" show={s.step >= 1 && a.width > 0} arrow label="POST" labelAt={compact ? .37 : .5} />
      <Connector class="an-response" from={backFrom} to={backTo} route="straight" show={s.step >= 2 && b.width > 0} arrow dashed label="200 OK" labelAt={compact ? .37 : .5} />
      <span class="an-composed-rest" data-target="flow-rest" style={`left:${w - 34}px;top:${compact ? 275 : 290}px`}></span>
    {/snippet}
  </Stage>
{/snippet}

{#snippet followStudy(w: number)}
  {@const compact = w < 480}
  {@const start = { x: compact ? 36 : 90, y: compact ? 181 : 164, width: compact ? 168 : 188, height: 110 }}
  {@const end = { x: compact ? w - 228 : w - 302, y: compact ? 224 : 176, width: compact ? 192 : 242, height: compact ? 128 : 142 }}
  <Stage width={w} height={compact ? 420 : 380} initial={{ selected: false, arranged: false }} poster={{ selected: true, arranged: true }} script={followScript} cursor={{ at: { x: w - 25, y: 362 } }} greys="cool" accent="#6c7bb7" className="an-study an-follow">
    {#snippet children(s)}
      <div class="an-canvas-panel"><header class="an-product-head"><strong>Travel board</strong><div class="an-canvas-actions"><span data-target="arrange" data-cursor="hand">Arrange</span><span data-target="restore" data-cursor="hand">Reset</span></div></header><span class="an-canvas-rest" data-target="follow-rest"></span></div>
      <!-- Object, leader and note share Follow's changing coordinate space.
          Reading the destination rect for an independent line would detach it
          while Follow is still traveling toward that destination. -->
      <Follow to={s.arranged ? end : start} stiffness={.16} className="an-moving-layer">
        <div class="an-layer-art" data-target="layer" data-cursor="hand"><img src={lakePhoto} alt="Mount Fuji reflected in Lake Kawaguchi" draggable="false" /></div>
        <div class="an-follow-outline" data-visible={s.selected || undefined}></div>
        <div class="an-attached-note" data-visible={s.selected || undefined}><strong>Lake Kawaguchi</strong><span>Keep the reflection visible</span></div>
        <svg class="an-attached-leader" data-visible={s.selected || undefined} aria-hidden="true"><path d="M.75 0V18" /><circle cx=".75" cy="18" r="2" /></svg>
      </Follow>
    {/snippet}
  </Stage>
{/snippet}

{#snippet branchStudy(w: number)}
  {@const compact = w < 520}
  {@const names = ['Preview', 'Search', 'Archive']}
  <Stage width={w} height={compact ? 340 : 320} initial={{ phase: 0, clearing: false }} poster={{ phase: 4, clearing: false }} script={branchScript} cursor={{ at: { x: 25, y: compact ? 312 : 292 } }} greys="cool" accent="#8659cc" className="an-study an-branch">
    {#snippet children(s, rect)}
      {@const source = rect('asset-source')}
      {@const outputs = names.map((_, i) => rect(`asset-output-${i}`))}
      {@const ports = outputs.map((r) => compact ? { x: r.x + r.width / 2, y: r.y } : { x: r.x, y: r.y + r.height / 2 })}
      {@const start = compact ? { x: source.x + source.width / 2, y: source.y + source.height } : { x: source.x + source.width, y: source.y + source.height / 2 }}
      {@const junction = compact ? { x: start.x, y: 216 } : { x: w - 278, y: ports[1].y }}
      {@const ends = compact ? ports.map((p) => ({ x: p.x, y: junction.y })) : ports.map((p) => ({ x: junction.x, y: p.y }))}
      {@const measured = source.width > 0 && outputs.every((r) => r.width > 0) && !s.clearing}
      <header class="an-flow-title"><strong>Asset processing</strong><span data-target="clear-jobs" data-cursor="hand">Clear jobs</span></header>
      <section class="an-asset-source" data-target="asset-source" style={compact ? `left:${(w - 180) / 2}px;top:76px;width:180px;height:100px` : 'left:34px;top:110px;width:180px;height:100px'}>
        <div class="an-asset-file"><Icon name="file" size={22} className="an-file-preview" /><div><strong>cover.jpg</strong><span>2.4 MB · Image</span></div></div>
        <div class="an-asset-action" data-target="process-asset" data-cursor="hand"><States value={s.phase === 0 ? 'idle' : s.phase === 1 ? 'storing' : 'stored'} states={{ idle: 'Process file', storing: 'Storing…', stored: 'Stored' }} /></div>
      </section>
      {#each names as name, i}
        <section class="an-asset-output" data-compact={compact || undefined} data-ready={s.phase >= (i === 1 ? 3 : 4) || undefined} aria-label={`${name}: ${s.phase >= (i === 1 ? 3 : 4) ? 'ready' : 'waiting'}`} style={compact ? `left:${16 + i * (w - 104) / 2}px;top:254px;width:72px;height:48px` : `left:${w - 214}px;top:${64 + i * 80}px;width:180px;height:48px`}>
          <strong class="an-job-pill" data-target={`asset-output-${i}`}><span>{name}</span><span class="an-job-mark"><Icon name="check" size={12} className="an-job-check" /></span></strong>
        </section>
      {/each}
      <!-- Travel reaches the center first. Two non-overlapping spine halves
          grow out from there; outer branches wait for those arrivals.
          Connector owns each endpoint marker's actual arrival timing. -->
      <Connector class="an-asset-trunk" from={start} to={junction} route="straight" show={measured && s.phase >= 1} />
      {#each [0, 2] as i}
        <Connector class={`an-asset-spine an-asset-spine--${i}`} from={junction} to={ends[i]} route="straight" show={measured && s.phase >= 2} />
      {/each}
      {#each ports as port, i}
        <Connector class={`an-asset-branch an-asset-branch--${i}`} from={ends[i]} to={port} route="straight" arrow show={measured && s.phase >= (i === 1 ? 2 : 3)} />
      {/each}
      <span class="an-composed-rest" data-target="graph-rest" style={`left:24px;top:${compact ? 188 : 256}px`}></span>
    {/snippet}
  </Stage>
{/snippet}

{#snippet streamStudy(w: number)}
  {@const compact = w < 520}
  <Stage width={w} height={compact ? 504 : 330} initial={{ connected: false, receiving: false }} poster={{ connected: true, receiving: true }} script={streamScript} play="once" cursor={{ at: { x: 25, y: compact ? 356 : 270 } }} greys="cool" accent="#0d9488" className={`an-study an-stream${compact ? ' an-stream--compact' : ''}`}>
    {#snippet children(s, rect)}
      {@const a = rect('stream-source')}
      {@const b = rect('stream-destination')}
      {@const from = compact ? { x: a.x + a.width / 2, y: a.y + a.height } : { x: a.x + a.width, y: a.y + a.height / 2 }}
      {@const to = compact ? { x: b.x + b.width / 2, y: b.y } : { x: b.x, y: from.y }}
      {@const path = `M${from.x} ${from.y}L${to.x} ${to.y}`}
      {@const arrow = compact ? `M${to.x - 3.5} ${to.y - 5}L${to.x} ${to.y}L${to.x + 3.5} ${to.y - 5}` : `M${to.x - 5} ${to.y - 3.5}L${to.x} ${to.y}L${to.x - 5} ${to.y + 3.5}`}
      <header class="an-flow-title"><strong>Event stream</strong><span class="an-stream-status" data-live={s.receiving || undefined}><i></i><States align="start" value={s.receiving ? 'live' : s.connected ? 'opening' : 'idle'} states={{ idle: 'Offline', opening: 'Connecting', live: 'Live' }} /></span></header>
      <section class="an-stream-node an-stream-source" data-target="stream-source" style={compact ? `left:32px;top:68px;width:${w - 64}px` : 'left:32px;top:123px;width:160px'}>
        <div class="an-stream-source-title"><span class="an-stream-source-icon"><Icon name="bolt" size={16} /></span><div><strong>Checkout</strong><span>Production</span></div></div>
        <div class="an-stream-connect" data-target="connect-stream" data-cursor="hand"><States value={s.receiving ? 'live' : s.connected ? 'opening' : 'idle'} states={{ idle: 'Connect stream', opening: 'Connecting…', live: 'Connected' }} /></div>
      </section>
      <section class="an-stream-warehouse" data-target="stream-destination" style={compact ? `left:32px;top:266px;width:${w - 64}px` : `left:${w - 276}px;top:80px;width:244px`}>
        <header><strong>Events</strong><span>Live feed</span></header>
        <div class="an-stream-columns"><span>Event</span><span>Time</span></div>
        <div class="an-stream-record" data-visible={s.receiving || undefined}><span><i></i><States align="start" value={s.receiving ? 'live' : 'idle'} states={{ idle: 'Checkout started', live: 'Checkout completed' }} /></span><time><States align="end" value={s.receiving ? 'live' : 'idle'} states={{ idle: '14:31', live: '14:32' }} /></time></div>
        <div class="an-stream-history"><span>Customer created</span><time>14:31</time></div>
        <div class="an-stream-history"><span>Session started</span><time>14:31</time></div>
        <footer class="an-stream-receiving" data-live={s.receiving || undefined}><i></i><States align="start" value={s.receiving ? 'live' : s.connected ? 'opening' : 'idle'} states={{ idle: 'Stream disconnected', opening: 'Opening route', live: 'Receiving events' }} /></footer>
      </section>
      <svg class="an-stream-route" data-active={s.connected || undefined} data-arrived={s.receiving || undefined} data-ready={(a.width > 0 && b.width > 0) || undefined} style={`--an-stream-reveal-duration:${STREAM_REVEAL_MS}ms`} aria-hidden="true">
        <defs><mask id={revealId} maskUnits="userSpaceOnUse"><path class="an-stream-reveal" d={path} pathLength="1" /></mask></defs>
        <path class="an-stream-underlay" d={path} />
        <path class="an-stream-phase" d={path} mask={`url(#${revealId})`} />
        <path class="an-stream-arrow" d={arrow} />
      </svg>
      <span class="an-stream-rate" data-visible={s.receiving || undefined} style={compact ? `left:${from.x + 12}px;top:${(from.y + to.y) / 2 - 8}px` : `left:${(from.x + to.x) / 2}px;top:${from.y - 26}px;transform:translateX(-50%)`}>1.2k / sec</span>
      <span class="an-stream-rest" data-target="stream-rest" style={`left:${w - 34}px;top:${compact ? 215 : 290}px`}></span>
    {/snippet}
  </Stage>
{/snippet}

{#snippet collectionStudy(w: number)}
  {@const compact = w < 520}
  {@const rows = [
    { name: 'API requests', meter: 'API calls', value: '24.8k', amount: '$124.00', colour: '#3478e5' },
    { name: 'Storage', meter: 'Storage', value: '18.2 GB', amount: '$18.20', colour: '#3478e5' },
    { name: 'Background jobs', meter: 'Jobs', value: '312', amount: '$46.80', colour: '#3478e5' },
  ]}
  <Stage width={w} height={compact ? 636 : 464} initial={{ phase: 0 }} poster={{ phase: 3 }} script={collectUsage} play="once" cursor={{ at: { x: 24, y: compact ? 378 : 440 } }} greys="cool" accent="#3478e5" className="an-study an-collection">
    {#snippet children(s, rect)}
      {@const sources = rows.map((_, i) => rect(`usage-source-${i}`))}
      {@const invoice = rect('usage-invoice')}
      {@const field = rect('usage-invoice-field')}
      {@const junction = { x: sources[1].x + sources[1].width + 24, y: sources[1].y + sources[1].height / 2 }}
      {@const destination = { x: invoice.x + invoice.width, y: field.y + field.height / 2 }}
      {@const ready = sources.every((r) => r.width > 0) && invoice.width > 0 && field.width > 0}
      {@const outer = w - 16}
      {@const radius = 6}
      {@const direction = destination.y > junction.y ? 1 : -1}
      {@const delivery = `M${junction.x} ${junction.y}H${outer - radius}Q${outer} ${junction.y} ${outer} ${junction.y + direction * radius}V${destination.y - direction * radius}Q${outer} ${destination.y} ${outer - radius} ${destination.y}H${destination.x}`}
      <div class="an-collection-scene" data-live={s.phase >= 1 || undefined}>
        <section class="an-usage-invoice" data-target="usage-invoice" style={compact ? `left:16px;top:28px;width:${w - 52}px` : `left:28px;top:108px;width:${w - 252}px`}>
          <header><strong>Invoice</strong><span>#0084 · October 2026</span></header>
          <div class="an-invoice-recipient"><span>Bill to</span><strong>Coast workspace</strong></div>
          <div class="an-invoice-balance">
            <div class="an-invoice-balance-head" data-target="usage-invoice-field"><span>Amount due</span><span class="an-invoice-live"><i class="an-invoice-status-dot" data-ready={s.phase === 3 || undefined}></i><States align="start" value={s.phase === 3 ? 'ready' : 'waiting'} states={{ waiting: 'Awaiting usage', ready: 'Live usage' }} /></span></div>
            <div class="an-invoice-total"><States align="start" value={s.phase === 3 ? 'amount' : 'empty'} states={{ empty: '$0.00', amount: '$189.00' }} /></div>
          </div>
          <div class="an-invoice-lines">{#each rows as row}<div><span>{row.name}</span><States align="end" value={s.phase === 3 ? 'amount' : 'empty'} states={{ empty: '—', amount: row.amount }} /></div>{/each}</div>
        </section>
        <section class="an-usage-monitor" style={compact ? `left:16px;top:400px;width:${Math.min(228, w - 92)}px` : `left:${w - 278}px;top:28px;width:228px`}>
          <header><strong>Usage</strong><span>October</span></header>
          <div class="an-usage-sources">{#each rows as row, i}<div class="an-usage-source" data-target={`usage-source-${i}`}><span><i class="an-source-cue" style={`background:${row.colour}`}></i>{row.meter}</span><strong>{row.value}</strong></div>{/each}</div>
          <div class="an-usage-sync" data-target="sync-usage" data-cursor="hand"><States value={s.phase === 0 ? 'idle' : s.phase < 3 ? 'busy' : 'done'} states={{ idle: 'Connect', busy: 'Connecting…', done: 'Connected' }} /></div>
        </section>
        {#each sources as source, i}
          <Connector class={`an-usage-feed an-fine-dotted an-usage-feed--${i}`} from={{ x: source.x + source.width, y: source.y + source.height / 2 }} to={junction} route="h" radius={6} dashed dots="none" show={ready && s.phase >= 1} />
        {/each}
        <svg class="ss-connector an-usage-delivery" data-show={(ready && s.phase >= 2) || undefined} use:arrivedWhenDrawn={ready && s.phase >= 2} aria-hidden="true"><path class="ss-connector__line" d={delivery} pathLength="1" /><path class="ss-connector__arrow" d={`M${destination.x + 6} ${destination.y - 4}L${destination.x} ${destination.y}L${destination.x + 6} ${destination.y + 4}`} /></svg>
        <svg class="an-usage-junction" data-visible={(ready && s.phase >= 2) || undefined} aria-hidden="true"><circle cx={junction.x} cy={junction.y} r="3" /></svg>
        <span class="an-composed-rest" data-target="usage-rest" style={`left:${compact ? 16 : w - 74}px;top:${compact ? 369 : 290}px`}></span>
      </div>
    {/snippet}
  </Stage>
{/snippet}

{#snippet detailStudy(w: number)}
  {@const compact = w < 520}
  <Stage width={w} height={compact ? 600 : 436} initial={{ phase: 0, selected: false, clearing: false }} poster={{ phase: 4, selected: true, clearing: false }} script={inspectPayout} play="once" cursor={{ at: { x: w - 24, y: compact ? 574 : 410 } }} greys="cool" accent="#326be6" className="an-study an-detail">
    {#snippet children(s, rect)}
      {@const row = rect('payout-row')}
      {@const detail = rect('settlement-detail')}
      {@const note = rect('arrival-note')}
      {@const from = { x: row.x + row.width / 2, y: row.y + row.height }}
      {@const to = compact ? { x: detail.x + detail.width / 2, y: detail.y } : { x: detail.x + detail.width, y: detail.y + detail.height - 34 }}
      {@const leaderFrom = { x: detail.x + detail.width / 2, y: detail.y + detail.height }}
      {@const leaderTo = { x: note.x + note.width / 2, y: note.y }}
      {@const measured = row.width > 0 && detail.width > 0 && note.width > 0 && !s.clearing}
      <div class="an-detail-scene" data-transmitting={s.phase === 1 || undefined}>
        <section class="an-payout-panel" style={compact ? `left:16px;top:28px;width:${w - 32}px` : `left:244px;top:28px;width:${w - 272}px`}>
          <header><div><strong>Payouts</strong><span>Checking •0814</span></div><span data-target="clear-payout" data-cursor="hand">Clear detail</span></header>
          <div class="an-payout-columns"><span>Created</span><span>Amount</span></div>
          <div class="an-payout-row"><span>Oct 18 <small>Paid</small></span><strong>$740.00</strong></div>
          <div class="an-payout-row"><span>Oct 22 <small>Paid</small></span><strong>$920.00</strong></div>
          <div class="an-payout-row" data-target="payout-row" data-cursor="hand" data-selected={s.selected || undefined}><span>Today <small>Scheduled</small></span><strong>$1,284.60</strong></div>
        </section>
        <section class="an-settlement-detail" data-target="settlement-detail" data-visible={(s.phase >= 2 && !s.clearing) || undefined} style={compact ? `left:32px;top:314px;width:${w - 64}px` : 'left:28px;top:150px;width:224px'}>
          <header><span>Settlement</span><Icon name="check" size={12} /></header>
          <strong class="an-settlement-amount">$1,284.60</strong><span class="an-settlement-subtitle">Net to your account</span>
          <div class="an-settlement-breakdown"><div><span>Payments</span><span>$1,320.00</span></div><div><span>Fees</span><span>−$35.40</span></div></div>
        </section>
        <div class="an-arrival-note" data-target="arrival-note" data-visible={(s.phase >= 4 && !s.clearing) || undefined} style={compact ? `left:32px;top:536px;width:${w - 64}px` : 'left:28px;top:372px;width:224px'}><strong>Expected arrival</strong><span>Oct 27 · Checking •0814</span></div>
        <Connector class="an-record-link an-fine-dotted" from={from} to={to} route={compact ? 'straight' : 'v'} dots="end" dashed show={measured && s.phase >= 1} />
        <Connector class="an-detail-leader" from={leaderFrom} to={leaderTo} route="straight" dots="none" show={measured && s.phase >= 3} />
        <span class="an-composed-rest" data-target="payout-rest" style={`left:${w - 36}px;top:${compact ? 280 : 350}px`}></span>
      </div>
    {/snippet}
  </Stage>
{/snippet}

<div class="an-gallery" bind:clientWidth={hostWidth}>
  <div class="an-picker"><label for={pickerId}>Study</label><select id={pickerId} value={selected} onchange={(event) => selectStudy((event.currentTarget as HTMLSelectElement).value as Study)}>{#each studies as study}<option value={study.id}>{study.title}</option>{/each}</select><button type="button" onclick={() => revision++} aria-label="Replay annotation study"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3.2 4.3A4.5 4.5 0 1 1 2.6 8M3.2 1.8v2.8H6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" /></svg></button></div>
  {#if width !== null}
    {#key `${selected}-${revision}`}
      <div class="an-scene" data-annotation={selected}>
        {#if selected === 'collect'}
          {@render collectionStudy(width)}
        {:else if selected === 'detail'}
          {@render detailStudy(width)}
        {:else if selected === 'chart'}
          {@render chartStudy(width)}
        {:else if selected === 'measure'}
          {@render measureStudy(width)}
        {:else if selected === 'flow'}
          {@render flowStudy(width)}
        {:else if selected === 'branch'}
          {@render branchStudy(width)}
        {:else if selected === 'stream'}
          {@render streamStudy(width)}
        {:else}
          {@render followStudy(width)}
        {/if}
      </div>
    {/key}
  {/if}
  <p class="an-description">{active.note}</p>
</div>
