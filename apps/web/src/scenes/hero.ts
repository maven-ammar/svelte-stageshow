import { between, contains, type Act, type Point, type Rect } from 'svelte-stageshow'

// A dev tool's hero: annotate a dashboard three ways, copy the feedback, paste
// it into Claude Code. Ported from the gold example's state and script.

export type Tone = 'blue' | 'green' | 'orange'
export type Marker = { at: Point; show: boolean }

export interface HeroState {
  toolbar: boolean
  highlight: boolean
  popup: { show: boolean; header: string; at: Point; tone: Tone }
  typed: string
  drag: Rect | null
  dragging: boolean
  area: { r: Rect; show: boolean }
  picked: string[]
  selection: Rect | null
  m3: Marker
  m4: Marker
  m5: Marker
  copied: boolean
  terminal: boolean
  pasted: string
}

export const HERO_TITLE = "Maya's Dashboard"
export const HERO_OUTPUT = `## Page feedback

Export button: primary style
Sidebar icons: hover states
Dashboard title: more prominence`

export const HERO_REST = {
  wide: { x: 432, y: 212 },
  compact: { x: 280, y: 270 },
}

const hidden = (m: Marker): Marker => ({ ...m, show: false })

export const HERO_INITIAL: HeroState = {
  toolbar: false,
  highlight: false,
  popup: { show: false, header: '', at: { x: 0, y: 0 }, tone: 'blue' },
  typed: '',
  drag: null,
  dragging: false,
  area: { r: { x: 0, y: 0, width: 0, height: 0 }, show: false },
  picked: [],
  selection: null,
  m3: { at: { x: 0, y: 0 }, show: false },
  m4: { at: { x: 0, y: 0 }, show: false },
  m5: { at: { x: 0, y: 0 }, show: false },
  copied: false,
  terminal: false,
  pasted: '',
}

export const HERO_POSTER: HeroState = {
  ...HERO_INITIAL,
  toolbar: true,
  copied: true,
  terminal: true,
  pasted: HERO_OUTPUT,
}

async function annotate(a: Act<HeroState>, header: string, tone: Tone, at: Point, text: string) {
  const width = a.layout === 'compact' ? 358 : 720
  const placed = { x: Math.max(116, Math.min(width - 116, at.x)), y: at.y }
  await a.set((s) => ({ popup: { ...s.popup, show: true, header, at: placed, tone }, typed: '' }))
  await a.wait(300)
  await a.type('typed', text)
  await a.wait(300)
  await a.click('add')
  await a.set((s) => ({ popup: { ...s.popup, show: false } }))
  await a.wait(200)
}

export async function heroScript(a: Act<HeroState>) {
  await a.wait(600)

  // Open the toolbar
  await a.move('toolbar')
  await a.wait(300)
  await a.click()
  await a.set({ toolbar: true })
  await a.wait(600)

  // 1. Click an element
  await a.move('export')
  await a.set({ highlight: true })
  await a.wait(400)
  await a.click()
  await a.set({ highlight: false })
  await a.wait(100)
  const btn = a.rect('export')
  await annotate(a, 'button.export-btn', 'blue', { x: btn.x + btn.width / 2 - 80, y: btn.y + btn.height + 10 }, 'Change to primary style')
  await a.set({ m3: { at: a.center('export'), show: true } })
  await a.wait(600)

  // 2. Drag over an area
  const icons = a.rect('icons')
  const from = { x: icons.x + icons.width + 2, y: icons.y + icons.height + 2 }
  const to = { x: icons.x - 2, y: icons.y - 2 }
  await a.move(from)
  await a.wait(150)
  await a.drag(to, (at) => {
    const drag = between(from, at)
    const picked = ['icon-0', 'icon-1', 'icon-2'].filter((n) => contains(drag, a.rect(n)))
    a.put({ drag, picked, dragging: true })
  })
  await a.wait(200)
  await a.set({ dragging: false, picked: [], area: { r: between(from, to), show: true } })
  await annotate(a, 'Sidebar icons', 'green', { x: to.x + 110, y: (from.y + to.y) / 2 - 40 }, 'Add hover states')
  await a.set({ m4: { at: { x: from.x, y: to.y }, show: true } })
  await a.wait(400)

  // 3. Select text
  const title = a.rect('title')
  const y = title.y + title.height / 2
  await a.move({ x: title.x, y })
  await a.wait(150)
  await a.drag(
    { x: title.x + title.width, y },
    (at) => a.put({ selection: { x: title.x, y: title.y - 2, width: at.x - title.x, height: 16 } }),
  )
  await a.wait(200)
  await annotate(a, `"${HERO_TITLE}"`, 'orange', { x: Math.max(100, title.x + title.width / 2), y: title.y + title.height + 7 }, 'Make this more prominent')
  await a.set({ selection: null, m5: { at: { x: title.x + title.width + 2, y }, show: true } })
  await a.wait(400)

  // Copy, then paste into the agent
  await a.move('copy')
  await a.wait(400)
  await a.click()
  await a.set({ copied: true })
  await a.wait(400)
  await a.set({ terminal: true })
  await a.wait(600)
  await a.click('terminal-input')
  await a.key('cmd+v')
  await a.set({ pasted: HERO_OUTPUT })
  await a.move('rest')
  await a.wait(2000)

  // Put everything back, so the loop has no seam
  await a.set((s) => ({ ...HERO_INITIAL, m3: hidden(s.m3), m4: hidden(s.m4), m5: hidden(s.m5), area: { ...s.area, show: false }, pasted: s.pasted, popup: s.popup }))
  await a.move('rest')
  await a.wait(400)
  await a.set({ ...HERO_INITIAL })
}
