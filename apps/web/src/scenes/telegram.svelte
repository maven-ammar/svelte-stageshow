<script lang="ts">
  import { Avatar, Bubble, Phone, Stage, Stamp, Thread, type Act } from 'svelte-stageshow'
  import './telegram.css'

  const kawaguchiko = new URL('../assets/kawaguchiko.jpg', import.meta.url).href

  type Tick = 'clock' | 'sent' | 'read'
  type S = { draft: string; sent: boolean; tick: Tick; reply: boolean }

  const initial: S = { draft: '', sent: false, tick: 'clock', reply: false }
  const poster: S = { ...initial, sent: true, tick: 'read', reply: true }

  const MINE = "I'm in, I'll bring coffee"
  // Where the touch rests between taps, in stage pixels (below the composer)
  const REST = { x: 300, y: 470 }

  async function script(a: Act<S>) {
    await a.wait(900)
    a.mark('type')
    await a.type('draft', MINE, { interval: 70 })
    await a.wait(250)
    a.mark('send')
    await a.click({ at: 'send', x: 0.5, y: 0.5 })
    await a.set({ sent: true, draft: '' })
    await a.wait(650)
    await a.set({ tick: 'sent' })
    await a.wait(1000)
    a.mark('read')
    await a.set({ tick: 'read' })
    await a.wait(1500)
    a.mark('reply')
    await a.set({ reply: true })
    await a.wait(3000)
    a.mark('done')
  }
</script>

{#snippet ticks(state: Tick)}
  <svg class="tg-ticks" data-state={state} viewBox="0 0 17 11" width="17" height="11" aria-hidden="true">
    <g class="tg-ticks__clock">
      <circle cx="6" cy="5.5" r="4.6" />
      <path d="M6 3v2.7l1.7 1" />
    </g>
    <path class="tg-ticks__one" pathLength={1} d="M1.2 5.9 4.1 8.8 10.4 1.6" />
    <path class="tg-ticks__two" pathLength={1} d="M7.4 8.1 8.1 8.8 14.4 1.6" />
  </svg>
{/snippet}

{#snippet meta(time: string, tick?: Tick)}
  <span class="tg-meta">
    {time}
    {#if tick}{@render ticks(tick)}{/if}
  </span>
{/snippet}

{#snippet backIcon()}
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <path d="M14.5 5 7.5 12l7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
{/snippet}

{#snippet clipIcon()}
  <svg viewBox="0 0 24 24" width="25" height="25" aria-hidden="true">
    <path
      d="M19.6 11.4 12 19a5 5 0 0 1-7.1-7.1l8-8a3.4 3.4 0 0 1 4.8 4.8l-7.9 7.9a1.7 1.7 0 0 1-2.4-2.4l7.2-7.2"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
{/snippet}

{#snippet micIcon()}
  <svg viewBox="0 0 24 24" width="25" height="25" aria-hidden="true">
    <rect x="8.6" y="2.6" width="6.8" height="12" rx="3.4" fill="none" stroke="currentColor" stroke-width="1.8" />
    <path d="M5.4 11a6.6 6.6 0 0 0 13.2 0M12 17.6v3.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
  </svg>
{/snippet}

{#snippet stickerIcon()}
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <path
      d="M20.6 12.6A8.6 8.6 0 1 1 11.4 3.4c5 0 9.2 4.2 9.2 9.2Zm0 0c-4.6 0-8 3.4-8 8"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linejoin="round"
    />
    <circle cx="9" cy="10.4" r="1.15" fill="currentColor" />
    <circle cx="14" cy="10.4" r="1.15" fill="currentColor" />
  </svg>
{/snippet}

{#snippet sendIcon()}
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
    <path d="M12 19V5.6M6 11.2 12 5.2l6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
{/snippet}

<Stage
  width={400}
  height={520}
  {initial}
  {poster}
  {script}
  play="once"
  cursor={{ at: REST, style: 'touch' }}
  className="tg"
>
  {#snippet children(s)}
    <Phone width={340} className="tg-phone">
      <div class="tg-paper" aria-hidden="true"></div>
      <header class="tg-head">
        <span class="tg-glass tg-back">
          {@render backIcon()}
        </span>
        <span class="tg-glass tg-title">
          <span class="tg-name">Nika</span>
          <span class="tg-status">online</span>
        </span>
        <Avatar name="Nika" size={48} className="tg-avatar" style="background:linear-gradient(#f5a26b, #e9655e)" />
      </header>

      <Thread className="tg-thread">
        <Stamp className="tg-date">Yesterday</Stamp>
        <Bubble from="them">
          Did the new boots come?
          {@render meta('21:04')}
        </Bubble>
        <Bubble from="me">
          Yes! Breaking them in
          {@render meta('21:10', 'read')}
        </Bubble>
        <Stamp className="tg-date">Today</Stamp>
        <Bubble from="them">
          Free this weekend?
          {@render meta('8:12')}
        </Bubble>
        <Bubble from="me">
          Should be, why?
          {@render meta('8:20', 'read')}
        </Bubble>
        <Bubble from="them" className="tg-photo">
          <img class="tg-photo__img" src={kawaguchiko} width={252} height={168} alt="Mount Fuji above Lake Kawaguchi" />
          <span class="tg-photo__time">9:38</span>
        </Bubble>
        <Bubble from="them">
          Sunrise hike on Saturday?
          {@render meta('9:38')}
        </Bubble>
        {#if s.sent}
          <Bubble from="me" source="draft">
            {MINE}
            {@render meta('9:41', s.tick)}
          </Bubble>
        {/if}
        {#if s.reply}
          <Bubble from="them" className="tg-big">
            <span class="tg-emoji">🙌</span>
            <span class="tg-big__time">9:42</span>
          </Bubble>
        {/if}
      </Thread>

      <div class="tg-compose">
        <span class="tg-glass tg-round">
          {@render clipIcon()}
        </span>
        <span class="tg-glass tg-field">
          <span class="tg-field__text" data-target="draft">
            {s.draft}
            {#if s.draft}<i class="tg-caret"></i>{/if}
          </span>
          <span class="tg-field__ph" data-hide={s.draft ? '' : undefined}>
            Message
          </span>
          <span class="tg-field__icon">
            {@render stickerIcon()}
          </span>
        </span>
        <span class="tg-action">
          <span class="tg-glass tg-round tg-mic" data-off={s.draft ? '' : undefined}>
            {@render micIcon()}
          </span>
          <span class="tg-send" data-on={s.draft ? '' : undefined} data-target="send">
            {@render sendIcon()}
          </span>
        </span>
      </div>
    </Phone>
  {/snippet}
</Stage>
