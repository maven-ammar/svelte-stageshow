<script lang="ts">
  import { Avatar, Bar, Collapse, Facepile, Field, Menu, Popover, Roll, Row, Stage, Text, Window, type Act, type Layout } from 'svelte-stageshow'
  import './share.css'

  // A document editor's Share popover. Beats: Share opens the popover over the
  // document, an email is typed and committed as a chip with Enter, the role
  // menu sets Can edit, Invite drops the new person in at the top of the access
  // list. Share closes the popover; the list is reset while it is out of sight.
  //
  // What makes it hold up frame by frame:
  // - The popover is measured from the Share button: its right edge is the
  //   button's right edge, its top 8px below it. Nothing is hard-coded.
  // - The role picker sits inside the field, as wide as its longest label, so
  //   Can view to Can edit moves nothing; only the word changes. The field is
  //   wide enough for the whole email as text and as a chip.
  // - The role menu opens under its trigger and runs to the popover's inner
  //   edge, so it covers the role column whole: no word peeks out beside it.
  // - The document behind is placeholder bars, so the popover's edge only ever
  //   crosses filler, never a word.
  // - Every person is the same two-line Row, the new one included.
  // - The Enter keycap shows over the document, clear of the popover.
  //
  // Real strings: the title, the popover's labels, the email, the roles and the
  // people. The document behind is placeholder.

  type S = {
    open: boolean
    email: string
    typing: boolean
    chip: boolean
    menu: boolean
    role: string
    hover: number | undefined
    added: boolean
  }

  const initial: S = { open: false, email: '', typing: false, chip: false, menu: false, role: 'Can view', hover: undefined, added: false }

  // The still is the payoff: the popover open with the new person added
  const poster: S = { ...initial, open: true, added: true }

  const DOC = 'Launch brief'
  const EMAIL = 'priya@lumen.co'
  const ROLES = ['Can view', 'Can comment', 'Can edit']
  const EDIT = ROLES.indexOf('Can edit')

  async function script(a: Act<S>) {
    await a.wait(600)

    // 1. Share opens the popover; the field takes focus
    a.mark('open')
    await a.click({ at: 'share', x: 0.5, y: 0.55 })
    await a.set({ open: true })
    await a.wait(700)

    // 2. Type the email, then Enter commits it as a chip in place
    a.mark('type')
    await a.click({ at: 'field', x: 0.3, y: 0.5 })
    await a.set({ typing: true })
    await a.type('email', EMAIL, { interval: 55 })
    await a.set({ typing: false })
    await a.wait(250)
    await a.key('enter')
    await a.set({ chip: true })
    await a.wait(600)

    // 3. The role menu: open it, run down to Can edit, pick it
    a.mark('role')
    await a.click({ at: 'role', x: 0.45, y: 0.5 })
    await a.set({ menu: true })
    await a.wait(450)
    await a.move({ at: `role-${EDIT}`, x: 0.4, y: 0.55 })
    await a.wait(300)
    await a.click()
    await a.set({ menu: false, role: 'Can edit' })
    await a.wait(500)

    // 4. Invite: the person drops in at the top of the list, then the field
    //    clears. Two beats: one cause, one effect at a time, so the eye follows
    //    the chip into the list before the field empties behind it
    a.mark('invite')
    await a.click({ at: 'invite', x: 0.5, y: 0.55 })
    await a.set({ added: true })
    await a.wait(350)
    await a.set({ chip: false, email: '', role: 'Can view' })
    await a.wait(1850)

    // 5. Share again closes it; the list resets out of sight
    a.mark('close')
    await a.click({ at: 'share', x: 0.5, y: 0.55 })
    await a.set({ open: false })
    await a.wait(450)
    await a.snap({ added: false })
    await a.wait(500)
  }

  type Geo = { win: { x: number; y: number; w: number; h: number }; pop: number }

  // Wide: one 24px gutter above and either side of the window, which runs off
  // the bottom. Compact: the same at the column's width, a narrower popover.
  const GEO: Record<Layout, Geo> = {
    wide: { win: { x: 24, y: 24, w: 432, h: 360 }, pop: 344 },
    compact: { win: { x: 16, y: 20, w: 326, h: 400 }, pop: 310 },
  }

  /** The role menu sits 6px under the field, from its trigger's left edge to
   *  6px past the popover's inner edge (over the role column), in the popover's own coordinates. */
  function roleMenu(rect: (name: string) => { x: number; y: number; width: number; height: number }, pop: { left: number; top: number; width: number }) {
    const r = rect('role')
    const f = rect('field')
    const left = r.x - pop.left - 4
    return { left, top: f.y - pop.top + f.height + 6, width: pop.width - 10 - left }
  }
</script>

{#snippet tick(size: number)}
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
{/snippet}

{#snippet chevronDown(size: number)}
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
{/snippet}

{#snippet fileText(size: number, stroke = 1.75)}
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
{/snippet}

{#snippet lock(size: number, stroke = 2.25)}
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
{/snippet}

{#snippet person(name: string, email: string, role: string)}
  <Row className="sh-person" pad={6}>
    {#snippet lead()}<Avatar name={name} size={28} />{/snippet}
    {#snippet title()}{name}{/snippet}
    {#snippet subtitle()}{email}{/snippet}
    {#snippet meta()}<span class="sh-person__role">{role}</span>{/snippet}
  </Row>
{/snippet}

<Stage
  width={480}
  height={340}
  compact={{ below: 440, width: 358, height: 380 }}
  {initial}
  {poster}
  {script}
  keys={{ wide: 'bottom-left', compact: 'bottom-left' }}
  cursor={{ at: { at: 'doc', x: 0.3, y: 0.6 } }}
  className="sh"
>
  {#snippet children(s, rect, layout)}
    {@const g = GEO[layout]}
    {@const share = rect('share')}
    {@const pop = { left: share.x + share.width - g.pop, top: share.y + share.height + 8, width: g.pop }}
    {@const rolePop = roleMenu(rect, pop)}

    {#snippet roleView()}
      <span class="sh-menu__item">
        <span class="sh-menu__tick">{#if s.role === 'Can view'}{@render tick(12)}{/if}</span>
        Can view
      </span>
    {/snippet}
    {#snippet roleComment()}
      <span class="sh-menu__item">
        <span class="sh-menu__tick">{#if s.role === 'Can comment'}{@render tick(12)}{/if}</span>
        Can comment
      </span>
    {/snippet}
    {#snippet roleEdit()}
      <span class="sh-menu__item">
        <span class="sh-menu__tick">{#if s.role === 'Can edit'}{@render tick(12)}{/if}</span>
        Can edit
      </span>
    {/snippet}

    <Window
      className="sh-window"
      style={`left:${g.win.x}px;top:${g.win.y}px;width:${g.win.w}px;height:${g.win.h}px`}
      body={{ class: 'sh-body', 'data-crop': true }}
    >
      {#snippet lead()}
        <span class="sh-lead">
          {@render fileText(15, 1.75)}
          <span>{DOC}</span>
        </span>
      {/snippet}
      {#snippet toolbar()}
        <span class="sh-tools">
          <Facepile names={['Maya Chen', 'Leo Park']} size={22} overlap={3} />
          <span class="sh-share" data-target="share" data-cursor="pointer" data-on={s.open || undefined}>
            {@render lock(12, 2.25)}
            Share
          </span>
        </span>
      {/snippet}
      <div class="sh-doc" data-target="doc">
        <Bar w={180} h={12} tone={3} className="sh-doc__title" />
        <Bar w={300} h={7} tone={2} />
        <Bar w={340} h={7} tone={2} />
        <Bar w={250} h={7} tone={2} />
        <span class="sh-doc__gap"></span>
        <Bar w={320} h={7} tone={2} />
        <Bar w={280} h={7} tone={2} />
      </div>
    </Window>

    <Popover show={s.open} origin="top right" className="sh-pop" style={`left:${pop.left}px;top:${pop.top}px;width:${pop.width}px`}>
      <div class="sh-pop__head">
        <Text className="sh-pop__title">{`Share “${DOC}”`}</Text>
      </div>
      <div class="sh-invite">
        <Field
          className="sh-field"
          value={s.email}
          chip={s.chip}
          focused={s.open && !s.added && !s.menu}
          placeholder={layout === 'wide' ? 'Add people by email' : 'Add by email'}
          box={{ 'data-target': 'field' }}
        >
          {#snippet trailing()}
            <span class="sh-role">
              <span class="sh-role__hit" data-target="role" data-cursor="pointer" data-on={s.menu || undefined}>
                <Roll variant="fade" align="end">{s.role}</Roll>
                {@render chevronDown(12)}
              </span>
            </span>
          {/snippet}
        </Field>
        <span class="sh-invite__btn" data-target="invite" data-cursor="pointer" data-ready={s.chip || undefined}>
          Invite
        </span>
      </div>
      <div class="sh-access">
        <div class="sh-access__label">People with access</div>
        <div class="sh-people">
          <Collapse open={s.added} reveal="drop">
            {@render person('Priya Shah', EMAIL, 'Can edit')}
          </Collapse>
          {@render person('Maya Chen', 'maya@lumen.co', 'Owner')}
          {@render person('Leo Park', 'leo@lumen.co', 'Can view')}
        </div>
      </div>
      <Popover show={s.menu} origin="top left" className="sh-menu" style={`left:${rolePop.left}px;top:${rolePop.top}px;width:${rolePop.width}px`}>
        <Menu items={[roleView, roleComment, roleEdit]} targets={['role-0', 'role-1', 'role-2']} />
      </Popover>
    </Popover>
  {/snippet}
</Stage>
