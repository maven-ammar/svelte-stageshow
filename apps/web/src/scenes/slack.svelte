<script lang="ts">
  import { Bar, Collapse, Stage, Text, Window, type Act } from 'svelte-stageshow'
  import './slack.css'

  // Slack, in #design. Maya's message arrives, the user hovers it and taps 👀
  // from the quick reactions, opens the thread and replies. Closing the thread
  // leaves the reaction and reply summary in place until the host's Replay.
  //
  // Icons: Slack's own set isn't available, so the glyph paths below are Lucide's:
  // its rounded 1.75 stroke is the closest match to Slack's outline glyphs.

  type S = {
    arrived: boolean
    reacted: boolean
    thread: boolean
    focus: boolean
    typing: boolean
    draft: string
    replied: boolean
  }

  const initial: S = { arrived: true, reacted: false, thread: false, focus: false, typing: false, draft: '', replied: false }

  // Under reduced motion: the finished moment, reacted and replied in the open thread
  const poster: S = { ...initial, arrived: true, reacted: true, thread: true, replied: true }

  const MESSAGE = 'The new onboarding flow is ready for review. Can you take a look before standup?'
  const REPLY = "On it, I'll leave notes in the file"
  const REST = { x: 560, y: 250 }
  const FACE_LETTER: Record<string, string> = { maya: 'M', alex: 'A', p1: 'J', p2: 'R', p3: 'T' }

  async function script(a: Act<S>) {
    // Opens on the channel with Maya's message already in.
    await a.wait(1200)

    // Hover the message: the row lights up and its toolbar shows
    a.mark('hover')
    await a.move({ at: 'msg', x: 0.42, y: 0.55 })
    await a.wait(500)

    // 👀 from the quick reactions
    await a.move({ at: 'react-eyes', x: 0.82, y: 0.86 })
    await a.wait(220)
    a.mark('react')
    await a.click()
    await a.set({ reacted: true })
    await a.wait(1000)

    // Reply in thread
    await a.move({ at: 'reply-btn', x: 0.78, y: 0.82 })
    await a.wait(260)
    a.mark('thread')
    await a.click()
    await a.set({ thread: true })
    await a.wait(800)

    // Write the reply
    await a.move({ at: 'tbox', x: 0.62, y: 0.3 })
    await a.click()
    await a.set({ focus: true })
    await a.wait(350)
    await a.set({ typing: true })
    await a.type('draft', REPLY, { interval: 52 })
    await a.set({ typing: false })
    await a.wait(450)
    a.mark('send')
    await a.key('enter')
    await a.set({ draft: '', replied: true })
    await a.wait(500)
    // Step off the reply as it lands, so the pointer isn't parked on its words
    const box = a.rect('tbox')
    await a.move({ x: box.x + box.width * 0.7, y: box.y + box.height + 60 })
    await a.wait(1800)

    // Close the thread and hold the result. Replay is the explicit reset.
    a.mark('exit')
    await a.move({ at: 'tclose', x: 0.5, y: 0.5 })
    await a.wait(200)
    await a.click()
    await a.set({ thread: false, focus: false })
    await a.wait(500)
    await a.move(REST)
    await a.wait(1500)
    a.mark('done')
  }
</script>

{#snippet glyph(name: string, size = 16, stroke = 1.75)}
  <svg
    class="sl-i"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width={stroke}
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    {#if name === 'arrow-left'}
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    {:else if name === 'arrow-right'}
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    {:else if name === 'at-sign'}
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
    {:else if name === 'bell'}
      <path d="M10.268 21a2 2 0 0 0 3.464 0" />
      <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
    {:else if name === 'bookmark'}
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    {:else if name === 'chevron-down'}
      <path d="m6 9 6 6 6-6" />
    {:else if name === 'circle-help'}
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    {:else if name === 'clock'}
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    {:else if name === 'ellipsis'}
      <path d="M5 12h.01" />
      <path d="M12 12h.01" />
      <path d="M19 12h.01" />
    {:else if name === 'ellipsis-vertical'}
      <path d="M12 5h.01" />
      <path d="M12 12h.01" />
      <path d="M12 19h.01" />
    {:else if name === 'forward'}
      <path d="m15 17 5-5-5-5" />
      <path d="M4 18v-2a4 4 0 0 1 4-4h12" />
    {:else if name === 'hash'}
      <path d="M4 9h16" />
      <path d="M4 15h16" />
      <path d="M10 3 8 21" />
      <path d="M16 3l-2 18" />
    {:else if name === 'headphones'}
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
    {:else if name === 'house'}
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    {:else if name === 'message-square-text'}
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M13 8H7" />
      <path d="M17 12H7" />
    {:else if name === 'messages-square'}
      <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z" />
      <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
    {:else if name === 'mic'}
      <path d="M12 19v3" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <rect width="6" height="13" x="9" y="2" rx="3" />
    {:else if name === 'plus'}
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    {:else if name === 'search'}
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    {:else if name === 'send-horizontal'}
      <path d="m3 3 3 9-3 9 19-9Z" />
      <path d="M6 12h16" />
    {:else if name === 'smile'}
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <path d="M9 9h.01" />
      <path d="M15 9h.01" />
    {:else if name === 'smile-plus'}
      <path d="M22 11v1a10 10 0 1 1-9-10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <path d="M9 9h.01" />
      <path d="M15 9h.01" />
      <path d="M16 5h6" />
      <path d="M19 2v6" />
    {:else if name === 'square-pen'}
      <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
    {:else if name === 'type'}
      <path d="M4 7V4h16v3" />
      <path d="M9 20h6" />
      <path d="M12 4v16" />
    {:else if name === 'x'}
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    {/if}
  </svg>
{/snippet}

{#snippet face(who: string, size = 36)}
  {@const letter = FACE_LETTER[who] ?? ''}
  <span
    class="sl-face"
    data-who={who}
    style={`width:${size}px;height:${size}px;font-size:${Math.round(size * 0.42)}px;border-radius:${Math.round(size * 0.22)}px`}
  >
    {letter}
  </span>
{/snippet}

{#snippet sideBar(w: number, light = false)}
  <Bar w={w} h={6} style={`background:${light ? '#b192b3' : '#8c6a8e'}`} />
{/snippet}

{#snippet sidebar()}
  <aside class="sl-side">
    <div class="sl-side__head">
      <Text className="sl-side__ws">Northwind</Text>
      {@render glyph('chevron-down', 14)}
      <span class="sl-grow"></span>
      <span class="sl-side__compose">
        {@render glyph('square-pen', 15)}
      </span>
    </div>
    <div class="sl-side__list">
      {#each [46, 58] as w, i (i)}
        <div class="sl-side__row">
          <span class="sl-side__glyph"></span>
          {@render sideBar(w)}
        </div>
      {/each}
      <div class="sl-side__section">
        {@render glyph('chevron-down', 12)}
        {@render sideBar(52, true)}
      </div>
      <div class="sl-side__row">
        {@render glyph('hash', 14)}
        {@render sideBar(44)}
      </div>
      <div class="sl-side__row" data-active>
        {@render glyph('hash', 14)}
        <Text className="sl-side__name">design</Text>
      </div>
      {#each [60, 38] as w, i (i)}
        <div class="sl-side__row">
          {@render glyph('hash', 14)}
          {@render sideBar(w)}
        </div>
      {/each}
      <div class="sl-side__section">
        {@render glyph('chevron-down', 12)}
        {@render sideBar(74, true)}
      </div>
      {#each ['p1', 'maya', 'p3'] as who, i (who)}
        <div class="sl-side__row">
          {@render face(who, 18)}
          {@render sideBar([54, 66, 48][i])}
        </div>
      {/each}
    </div>
  </aside>
{/snippet}

{#snippet rail()}
  {@const items = [
    { icon: 'house', label: 'Home', active: true },
    { icon: 'messages-square', label: 'DMs', active: false },
    { icon: 'bell', label: 'Activity', active: false },
    { icon: 'ellipsis', label: 'More', active: false },
  ]}
  <nav class="sl-rail">
    <span class="sl-rail__ws">N</span>
    {#each items as it (it.label)}
      <span class="sl-rail__item" data-active={it.active || undefined}>
        <span class="sl-rail__btn">
          {@render glyph(it.icon, 18)}
        </span>
        <Text className="sl-rail__label">{it.label}</Text>
      </span>
    {/each}
    <span class="sl-grow"></span>
    <span class="sl-rail__plus">
      {@render glyph('plus', 16)}
    </span>
    <span class="sl-rail__me">
      {@render face('alex', 32)}
      <span class="sl-rail__status"></span>
    </span>
  </nav>
{/snippet}

{#snippet older(who: string, name: number, lines: number[])}
  <div class="sl-msg">
    {@render face(who)}
    <div class="sl-msg__body">
      <div class="sl-msg__meta sl-msg__meta--bars">
        <Bar w={name} h={7} tone={4} />
        <Bar w={34} h={5} tone={2} />
      </div>
      <div class="sl-msg__lines">
        {#each lines as w, i (i)}
          <Bar w={w} h={6} tone={2} />
        {/each}
      </div>
    </div>
  </div>
{/snippet}

{#snippet reaction(mine: boolean)}
  <span class="sl-react" data-mine={mine || undefined}>
    <span class="sl-react__emoji">👀</span>
    <span class="sl-react__count">1</span>
  </span>
{/snippet}

{#snippet hoverBar()}
  {@const quick = ['✅', '👀', '🙌']}
  <div class="sl-hover">
    {#each quick as e (e)}
      <span class="sl-hover__btn sl-hover__emoji" data-target={e === '👀' ? 'react-eyes' : undefined}>
        {e}
      </span>
    {/each}
    <span class="sl-hover__div"></span>
    <span class="sl-hover__btn">
      {@render glyph('smile-plus', 16)}
    </span>
    <span class="sl-hover__btn" data-target="reply-btn">
      {@render glyph('message-square-text', 16)}
    </span>
    <span class="sl-hover__btn">
      {@render glyph('forward', 16)}
    </span>
    <span class="sl-hover__btn">
      {@render glyph('bookmark', 16)}
    </span>
    <span class="sl-hover__btn">
      {@render glyph('ellipsis-vertical', 16)}
    </span>
  </div>
{/snippet}

{#snippet composer(placeholder: string, draft: string, focus: boolean, typing: boolean, target: string | undefined)}
  <div class="sl-compose" data-focus={focus || undefined} data-target={target} data-cursor={target ? 'ibeam' : undefined}>
    <div class="sl-compose__text">
      <span class="sl-compose__placeholder" data-hide={draft.length > 0 || undefined}>
        {placeholder}
      </span>
      <span class="sl-compose__draft">{draft}</span>
      <span class="sl-caret" data-show={focus || undefined} data-typing={typing || undefined}></span>
    </div>
    <div class="sl-compose__tools">
      <span class="sl-compose__round">
        {@render glyph('plus', 14)}
      </span>
      {@render glyph('type', 15)}
      {@render glyph('smile', 15)}
      {@render glyph('at-sign', 15)}
      <span class="sl-compose__sep"></span>
      {@render glyph('mic', 15)}
      <span class="sl-grow"></span>
      <span class="sl-compose__send" data-ready={draft.length > 0 || undefined}>
        {@render glyph('send-horizontal', 14)}
      </span>
    </div>
  </div>
{/snippet}

<Stage width={940} height={540} compact={{ below: 600, width: 440, height: 440 }} {initial} {poster} {script} play="once" cursor={{ at: REST }} className="sl" keys="bottom">
  {#snippet children(s)}
    <Window className="sl-win">
      {#snippet lead()}
        <span class="sl-top__nav">
          {@render glyph('arrow-left', 15)}
          {@render glyph('arrow-right', 15)}
          {@render glyph('clock', 15)}
        </span>
        <span class="sl-top__search">
          {@render glyph('search', 13)}
          <Text>Search Northwind</Text>
        </span>
      {/snippet}
      {#snippet toolbar()}
        <span class="sl-top__help">
          {@render glyph('circle-help', 15)}
        </span>
      {/snippet}
      <div class="sl-body">
        {@render rail()}
        <div class="sl-panel">
          {@render sidebar()}

          <section class="sl-channel" data-thread={s.thread || undefined}>
            <header class="sl-channel__head">
              <span class="sl-channel__title">
                {@render glyph('hash', 16)}
                <Text>design</Text>
                {@render glyph('chevron-down', 14)}
              </span>
              <span class="sl-grow"></span>
              <span class="sl-members">
                <span class="sl-members__faces">
                  {@render face('p1', 20)}
                  {@render face('maya', 20)}
                  {@render face('p2', 20)}
                </span>
                <span class="sl-members__count">12</span>
              </span>
              <span class="sl-headbtn">
                {@render glyph('headphones', 15)}
              </span>
            </header>
            <div class="sl-tabs">
              <span class="sl-tab" data-active>
                {@render glyph('message-square-text', 14)}
                <Text>Messages</Text>
              </span>
              <span class="sl-tab">
                <span class="sl-tab__glyph"></span>
                <Bar w={40} h={6} tone={2} />
              </span>
              <span class="sl-tab sl-tab--plus">
                {@render glyph('plus', 14)}
              </span>
            </div>

            <div class="sl-feed" data-crop>
              <div class="sl-divider">
                <span class="sl-divider__pill">
                  <Bar w={46} h={6} tone={3} />
                </span>
              </div>
              {@render older('p1', 74, [196])}
              {@render older('p2', 58, [142])}
              <Collapse open={s.arrived} className="sl-live">
                <div class="sl-row" data-target="msg">
                  <div class="sl-msg sl-msg--live">
                    {@render face('maya')}
                    <div class="sl-msg__body">
                      <div class="sl-msg__meta">
                        <Text className="sl-msg__name">Maya Chen</Text>
                        <Text className="sl-msg__time">10:42 AM</Text>
                      </div>
                      <p class="sl-msg__text">{MESSAGE}</p>
                      <Collapse open={s.reacted}>
                        <div class="sl-msg__reacts">
                          {@render reaction(true)}
                        </div>
                      </Collapse>
                      <Collapse open={s.replied}>
                        <div class="sl-replies">
                          {@render face('alex', 20)}
                          <Text className="sl-replies__link">1 reply</Text>
                          <Text className="sl-replies__when">Last reply just now</Text>
                        </div>
                      </Collapse>
                    </div>
                  </div>
                  {@render hoverBar()}
                </div>
              </Collapse>
            </div>

            <div class="sl-channel__compose">
              {@render composer('Message #design', '', false, false, undefined)}
            </div>
          </section>

          <div class="sl-thread-wrap" data-open={s.thread || undefined} data-crop>
            <aside class="sl-thread">
              <header class="sl-thread__head">
                <Text className="sl-thread__title">Thread</Text>
                <span class="sl-thread__where">
                  {@render glyph('hash', 12)}
                  <Text>design</Text>
                </span>
                <span class="sl-grow"></span>
                <span class="sl-headbtn" data-target="tclose">
                  {@render glyph('x', 15)}
                </span>
              </header>
              <div class="sl-thread__body">
                <div class="sl-msg sl-msg--thread">
                  {@render face('maya')}
                  <div class="sl-msg__body">
                    <div class="sl-msg__meta">
                      <Text className="sl-msg__name">Maya Chen</Text>
                      <Text className="sl-msg__time">10:42 AM</Text>
                    </div>
                    <p class="sl-msg__text">{MESSAGE}</p>
                    <div class="sl-msg__reacts">
                      {@render reaction(true)}
                    </div>
                  </div>
                </div>
                <Collapse open={s.replied}>
                  <div class="sl-thread__count">
                    <Text>1 reply</Text>
                    <span class="sl-thread__rule"></span>
                  </div>
                  <div class="sl-msg sl-msg--thread">
                    {@render face('alex')}
                    <div class="sl-msg__body">
                      <div class="sl-msg__meta">
                        <Text className="sl-msg__name">Alex Rivera</Text>
                        <Text className="sl-msg__time">10:43 AM</Text>
                      </div>
                      <p class="sl-msg__text">{REPLY}</p>
                    </div>
                  </div>
                </Collapse>
                <div class="sl-thread__compose">
                  {@render composer('Reply…', s.draft, s.focus, s.typing, 'tbox')}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </Window>
  {/snippet}
</Stage>
