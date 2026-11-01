<script lang="ts">
  import { Badge, Roll, Stage, Window, type Act } from 'svelte-stageshow'
  import './table-edit.css'

  type S = { edit: boolean; sel: boolean; val: string; amount: number; wash: boolean }

  const ROWS = [
    { who: 'Halvorsen & Co', amount: 2400, status: 'Paid', due: 'Oct 2' },
    { who: 'Lumen Studio', amount: 1200, status: 'Open', due: 'Oct 30' },
    { who: 'Tidepool', amount: 860, status: 'Open', due: 'Nov 4' },
    { who: 'Northwind Air', amount: 3150, status: 'Overdue', due: 'Oct 12' },
    { who: 'Kite Labs', amount: 540, status: 'Paid', due: 'Oct 9' },
  ]
  const EDIT = 1
  const money = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  const TONES = { Paid: 'success', Open: 'neutral', Overdue: 'danger' } as const

  const initial: S = { edit: false, sel: false, val: '', amount: 1200, wash: false }

  async function script(a: Act<S>) {
    await a.wait(900)
    a.mark('open')
    await a.move({ at: 'cell', x: 0.7, y: 0.5 })
    await a.wait(200)
    await a.click({ at: 'cell', x: 0.7, y: 0.5 }, { double: true })
    a.put({ edit: true, sel: true, val: '1,200.00' })
    // Off the digits while typing, as a hand does once it goes to the keys
    await a.move({ at: 'cell', x: -0.5, y: 1.5 }, { duration: 450 })
    await a.wait(200)
    a.mark('type')
    a.put({ sel: false, val: '' })
    await a.type('val', '1,450.00', { interval: 70 })
    await a.wait(400)
    // Enter commits. No keycap: it would sit over the total, the payoff
    a.mark('commit')
    a.put({ edit: false, amount: 1450, wash: true })
    await a.wait(900)
    a.put({ wash: false })
    await a.wait(1800)
  }
</script>

<Stage
  width={660}
  height={400}
  compact={{ below: 660, width: 358, height: 400 }}
  {initial}
  poster={{ ...initial, amount: 1450 }}
  {script}
  play="once"
  cursor={{ at: { x: 600, y: 350 } }}
  className="te"
>
  {#snippet children(s)}
    {@const total = ROWS.reduce((n, r, i) => n + (i === EDIT ? s.amount : r.amount), 0)}
    <Window url="app.ledger.io/invoices" className="te-win">
      <div class="te-body">
        <div class="te-row te-row--head">
          <span>Customer</span>
          <span class="te-num">Amount</span>
          <span>Status</span>
          <span class="te-due">Due</span>
        </div>
        {#each ROWS as r, i}
          <div class="te-row">
            <span class="te-who">{r.who}</span>
            {#if i === EDIT}
              <span class="te-num te-cell" data-target="cell" data-edit={s.edit || undefined} data-wash={s.wash || undefined}>
                <span class="te-ring"></span>
                <span class="te-text">
                  {#if s.edit}
                    <span class="te-dollar">$</span>
                    <span class="te-sel" data-on={s.sel || undefined}>{s.val}</span>
                    {#key s.val}
                      <span class="te-caret" data-hide={s.sel || undefined}></span>
                    {/key}
                  {:else}
                    {money(s.amount)}
                  {/if}
                </span>
              </span>
            {:else}
              <span class="te-num">{money(r.amount)}</span>
            {/if}
            <span>
              <Badge tone={TONES[r.status as keyof typeof TONES]}>{r.status}</Badge>
            </span>
            <span class="te-due">{r.due}</span>
          </div>
        {/each}
        <div class="te-row te-row--foot">
          <span>Total</span>
          <span class="te-num">
            <Roll delay={250}>{money(total)}</Roll>
          </span>
        </div>
      </div>
    </Window>
  {/snippet}
</Stage>
