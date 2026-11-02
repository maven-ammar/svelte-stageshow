<script lang="ts">
  import StageCollage from './StageCollage.svelte'
  import './dot-hero.css'

  // The hero: a warm bloom on near-black, grain over it, the claim in Instrument
  // Serif on the left, and a real stageshow composition on the right — the kit
  // demonstrating itself rather than a picture of itself.

  const command = 'npm install svelte-stageshow'
  let copied = $state(false)
  let timer: ReturnType<typeof setTimeout> | undefined

  async function copy() {
    let ok = false
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(command)
        ok = true
      }
    } catch {
      ok = false
    }
    if (!ok) {
      try {
        const area = document.createElement('textarea')
        area.value = command
        area.setAttribute('readonly', '')
        area.style.position = 'fixed'
        area.style.opacity = '0'
        document.body.appendChild(area)
        area.select()
        ok = document.execCommand('copy')
        document.body.removeChild(area)
      } catch {
        ok = false
      }
    }
    copied = ok
    clearTimeout(timer)
    timer = setTimeout(() => (copied = false), 1800)
  }
</script>

<section class="dot-hero">
  <div class="dot-hero__wash"></div>
  <div class="dot-hero__grain"></div>

  <div class="dot-hero__inner">
    <div class="dot-hero__copy">
      <h1>svelte stageshow</h1>
      <p class="dot-hero__sub">
        Framed product-shot UI for Svelte 5: real window chrome, a cursor that types and clicks
        under a script, and sixty-nine worked scenes to start from.
      </p>
      <div class="dot-hero__actions">
        <button class="dot-hero__command" type="button" onclick={copy} data-copied={copied}>
          <code>{command}</code>
          <span>{copied ? 'copied' : 'copy'}</span>
        </button>
        <a href="/scenes/static-card">Open the gallery</a>
      </div>
      <p class="dot-hero__pending">
        Not on npm yet —
        <a href="https://github.com/maven-ammar/svelte-stageshow/releases/tag/v0.2.0"
          >download from source</a
        >.
      </p>
    </div>

    <div class="dot-hero__stage">
      <StageCollage />
    </div>
  </div>
</section>
