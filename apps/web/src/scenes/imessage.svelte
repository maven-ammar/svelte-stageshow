<script lang="ts">
  import { Avatar, Bubble, Keyboard, Phone, Receipt, Stage, Stamp, Thread, type Act } from 'svelte-stageshow'
  import './imessage.css'

  // iMessage on an iPhone, for a landing page. Four beats:
  //   1. Context: Maya's two messages, keyboard up, the field focused.
  //   2. Reply: the person types (keys pop as iOS keys do), taps send; the
  //      bubble rises in, the receipt reads Delivered, then rolls to Read.
  //   3. Maya types (the dots), and the dots grow into her reply. Her reply
  //      makes the receipt redundant, so it folds away, as iOS does.
  // Hold the completed conversation. Replay is the explicit reset; sent
  // messages do not disappear from the live thread on their own.
  //
  // Real strings: Maya, the stamp, her two messages, the typed reply, the
  // receipt, her reply. The keyboard keeps its letters: it is the domain's
  // signature, not information.

  type S = {
    draft: string
    keys: boolean
    sent: boolean
    delivered: boolean
    read: boolean
    typing: boolean
    reply: boolean
  }

  const initial: S = {
    draft: '',
    keys: false,
    sent: false,
    delivered: false,
    read: false,
    typing: false,
    reply: false,
  }

  const MINE = "No way, I'm so in"
  const REPLY = "Leaving at 5, I'll drive"

  // The predictive bar follows the word being typed, as iOS's does
  const SUGGEST: Record<string, [string, string]> = {
    N: ['No', 'Not'],
    No: ['Now', 'Not'],
    w: ['was', 'we'],
    wa: ['way', 'was'],
    way: ['way', 'was'],
    'way,': ['I', 'I’m'],
    I: ['I’m', 'I'],
    "I'": ['I’m', 'I’ll'],
    "I'm": ['I’m', 'I’ve'],
    s: ['so', 'see'],
    so: ['so', 'soon'],
    i: ['in', 'is'],
    in: ['in', 'it'],
  }

  function suggestions(draft: string): [string, string, string] {
    const word = draft.split(' ').pop() ?? ''
    if (!word) return draft ? ['I', 'the', 'and'] : ['I', 'The', 'I’m']
    const [a, b] = SUGGEST[word] ?? [word, word]
    return [`“${word}”`, a, b]
  }

  async function script(a: Act<S>) {
    await a.wait(900)
    a.mark('type')
    await a.set({ keys: true })
    await a.type('draft', MINE, { interval: 95 })
    await a.wait(150)
    await a.set({ keys: false })
    await a.wait(250)
    a.mark('send')
    await a.click({ at: 'send', x: 0.5, y: 0.5 })
    await a.set({ sent: true, draft: '' })
    await a.wait(700)
    await a.set({ delivered: true })
    await a.wait(1200)
    await a.set({ read: true })
    await a.wait(900)
    a.mark('typing')
    await a.set({ typing: true })
    await a.wait(1900)
    await a.set({ typing: false, reply: true })
    await a.wait(3700)
    a.mark('done')
  }
</script>

{#snippet chevronLeft()}
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="m15 18-6-6 6-6" />
  </svg>
{/snippet}

{#snippet video()}
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
    <rect x="2" y="6" width="14" height="12" rx="2" />
  </svg>
{/snippet}

{#snippet plus()}
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
{/snippet}

{#snippet mic()}
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 19v3" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <rect x="9" y="2" width="6" height="13" rx="3" />
  </svg>
{/snippet}

{#snippet arrowUp()}
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="m5 12 7-7 7 7" />
    <path d="M12 19V5" />
  </svg>
{/snippet}

<Stage
  width={420}
  height={620}
  {initial}
  poster={{ ...initial, sent: true, delivered: true, read: true, reply: true }}
  {script}
  play="once"
  cursor={{ at: { x: 330, y: 420 }, style: 'touch' }}
  className="im"
>
  {#snippet children(s: S)}
    <div class="im-wash"></div>
    <Phone width={360} className="im-phone">
      <div class="im-app">
        <header class="im-head">
          <span class="im-back">
            {@render chevronLeft()}
          </span>
          <span class="im-contact">
            <Avatar name="Maya" tone="ios" size={46} className="im-avatar" />
            <span class="im-name">
              Maya
              <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true">
                <path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </span>
          <span class="im-video">
            {@render video()}
          </span>
        </header>

        <Thread className="im-thread">
          <Bubble from="them">Did you see the lake house?</Bubble>
          <Bubble from="me">Any luck finding a place?</Bubble>
          <Stamp>
            <b>Today</b> 9:38
          </Stamp>
          <Bubble from="them">Booked the cabin for Friday!</Bubble>
          <Bubble from="them">Hot tub and a lake view</Bubble>
          {#if s.sent}
            <Bubble from="me" source=".im-field__text">
              {MINE}
            </Bubble>
          {/if}
          {#if s.sent}
            <Receipt show={s.delivered} className="im-receipt">
              {s.read ? 'Read 9:41' : 'Delivered'}
            </Receipt>
          {/if}
          {#if s.typing || s.reply}
            <Bubble from="them" typing={s.typing}>
              {REPLY}
            </Bubble>
          {/if}
        </Thread>

        <div class="im-compose">
          <span class="im-plus">
            {@render plus()}
          </span>
          <span class="im-field">
            <span class="im-field__text">
              {s.draft}
              <i class="im-caret" data-solid={s.keys || undefined}></i>
              {#if !s.draft}<span class="im-field__ph">iMessage</span>{/if}
            </span>
            <span class="im-mic" data-off={!!s.draft || undefined}>
              {@render mic()}
            </span>
            <span class="im-send" data-on={!!s.draft || undefined} data-target="send">
              {@render arrowUp()}
            </span>
          </span>
        </div>

        <Keyboard typed={s.draft} suggestions={suggestions(s.draft)} />
      </div>
    </Phone>
  {/snippet}
</Stage>
