<script lang="ts">
  import { Icon, Stage } from 'svelte-stageshow'
  import type { Act } from 'svelte-stageshow'
  import './choreography.css'

  type Locale = { country: string; currency: string; price: string; method: string; fields: { label: string; value: string; half?: boolean }[] }
  const locales: Locale[] = [
    { country: 'United States', currency: 'USD', price: '$38.00', method: 'Card', fields: [
      { label: 'Name', value: 'Alex Morgan' }, { label: 'Street address', value: '24 Maple Avenue' }, { label: 'City', value: 'Portland', half: true }, { label: 'ZIP code', value: '97205', half: true },
    ] },
    { country: 'Germany', currency: 'EUR', price: '€35.00', method: 'Bank transfer', fields: [
      { label: 'Name', value: 'Alex Morgan' }, { label: 'Street and number', value: 'Lindenstraße 18' }, { label: 'Postcode', value: '10115', half: true }, { label: 'City', value: 'Berlin', half: true },
    ] },
    { country: 'Canada', currency: 'CAD', price: 'CA$52.00', method: 'Card', fields: [
      { label: 'Name', value: 'Alex Morgan' }, { label: 'Street address', value: '18 Cedar Lane' }, { label: 'City', value: 'Victoria', half: true }, { label: 'Province', value: 'BC', half: true }, { label: 'Postal code', value: 'V8V 1A1' },
    ] },
  ]

  type State = { locale: number }
  const initial: State = { locale: 0 }
  const poster: State = { locale: 2 }

  // Starts overlap. The currency identifies the change before the dependent
  // price, payment method and address respond. The final destination holds.
  async function localeSequence(a: Act<State>) {
    await a.wait(1600)
    a.mark('germany')
    await a.set({ locale: 1 })
    await a.wait(3300)
    a.mark('canada')
    await a.set({ locale: 2 })
    await a.wait(2900)
  }

  let width = $state(288)
</script>

{#snippet bank()}
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linejoin="round" aria-hidden="true"><path d="m2 4 5-2 5 2v1H2ZM3.5 6.5v3M7 6.5v3M10.5 6.5v3M2 11.5h10" /></svg>
{/snippet}

{#snippet price(locale: number)}
  <span class="cy-roll cy-price" aria-label={locales[locale].price}><span class="cy-vertical-track" aria-hidden="true">{#each locales as item}<span class="cy-roll-row">{item.price}</span>{/each}</span></span>
{/snippet}

{#snippet checkout(state: State, w: number, good: boolean, top: number)}
  {@const wide = w >= 560}
  <div class="cy-checkout" data-coordinated={good || undefined} data-locale={state.locale} data-layout={wide ? 'wide' : 'compact'}
    style={`width:${w - 32}px;height:420px;left:16px;top:${top}px;--cy-index:${state.locale}`}>
    <aside class="cy-order">
      <span class="cy-summary-heading">Order summary</span>
      <span class="cy-notebook" aria-hidden="true"><i></i><b>FIELD<br />JOURNAL</b></span>
      <div class="cy-product"><strong>Field journal</strong><span>Olive · dotted pages</span><span class="cy-quantity">Quantity 1</span></div>
      <div class="cy-total"><span>Total</span>{@render price(state.locale)}</div>
    </aside>
    <div class="cy-body">
      <div class="cy-form-heading">Delivery details</div>
      <div class="cy-locale"><span>Ship to</span><span class="cy-roll cy-currency" aria-label={`${locales[state.locale].country}, ${locales[state.locale].currency}`}><span class="cy-vertical-track" aria-hidden="true">{#each locales as item}<span class="cy-roll-row">{item.country}<b>·</b>{item.currency}</span>{/each}</span></span></div>
      <div class="cy-method">
        <span class="cy-label">Payment method</span>
        <div class="cy-method-control">
          <span class="cy-roll cy-method-icon"><span class="cy-vertical-track" aria-hidden="true">{#each locales as item}<span class="cy-roll-row">{#if item.method === 'Card'}<Icon name="card" size={14} />{:else}{@render bank()}{/if}</span>{/each}</span></span>
          <span class="cy-roll cy-method-name" aria-label={locales[state.locale].method}><span class="cy-vertical-track" aria-hidden="true">{#each locales as item}<span class="cy-roll-row">{item.method}</span>{/each}</span></span>
          <Icon name="chevron-down" size={12} />
        </div>
      </div>
      <div class="cy-address-viewport" data-crop>
        <div class="cy-address-track">{#each locales as item, index}<div class="cy-address" aria-hidden={index !== state.locale}>
          {#each item.fields as field}<div class="cy-field" data-half={field.half || undefined}><span class="cy-label">{field.label}</span><span class="cy-field-value">{field.value}</span></div>{/each}
        </div>{/each}</div>
      </div>
      <div class="cy-footer">
        <div class="cy-pay"><span class="cy-roll cy-pay-label" aria-label={`Pay ${locales[state.locale].price}`}><span class="cy-vertical-track" aria-hidden="true">{#each locales as item}<span class="cy-roll-row">Pay {item.price}</span>{/each}</span></span><Icon name="lock" size={12} /></div>
        <span>Shipping included</span>
      </div>
    </div>
  </div>
{/snippet}

<div class="cy-demo" bind:clientWidth={width}>
  <Stage width={width || 288} height={468} {initial} {poster} play="once" script={localeSequence}>
    {#snippet children(state)}
      <div class="cy-scene">{@render checkout(state, width || 288, true, 24)}</div>
    {/snippet}
  </Stage>
</div>
