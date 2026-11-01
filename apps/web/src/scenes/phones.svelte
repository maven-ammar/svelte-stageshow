<script lang="ts">
  import { Bar, LockScreen, Notification, Phone, Stage, WALLPAPER, type PhoneFrame } from 'svelte-stageshow'
  import { mail } from '../assets/app-icons'
  import './phones.css'

  // Every phone frame in the kit, at the same width. Narrow, a 150 phone's
  // notification can't be read, so each frame is drawn at 300 and cropped to
  // the half that shows it: the notification and the frame's bottom corners
  // (the top, for the frames with an app on screen).

  const FRAMES: PhoneFrame[] = ['pro', 'silver', 'bezel', 'android', 'soft', 'clay', 'outline', 'bare']
</script>

{#snippet checkout()}
  <div style="display:grid;gap:14px;padding:72px 28px">
    <div style="width:96px;height:96px;border-radius:20px;background:#f1f2f6;justify-self:center"></div>
    <div style="font:500 22px system-ui;text-align:center;color:#55607a">Oak dining chair</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px">
      <div style="height:64px;border-radius:14px;background:#000"></div>
      <div style="height:64px;border-radius:14px;background:#00d66f"></div>
    </div>
    {#each [70, 52, 64] as w, i (i)}
      <Bar w={`${w}%`} h={14} r={7} tone={2} />
    {/each}
  </div>
{/snippet}

{#snippet mailIcon()}
  <img src={mail} alt="" />
{/snippet}

{#snippet phoneFor(frame: PhoneFrame, app: boolean, width: number)}
  <Phone width={width} {frame} dark={!app} wallpaper={app ? undefined : WALLPAPER}>
    {#if app}
      {@render checkout()}
    {:else}
      <LockScreen>
        <Notification icon={mailIcon} title="Payment received" body="$249.00 from Jackson Hot Yoga" />
      </LockScreen>
    {/if}
  </Phone>
{/snippet}

<Stage specimen width={720} height={860} compact={{ below: 600, width: 358, height: 2862 }}>
  {#snippet children(_s, _rect, layout)}
    <div
      style={`display:grid;grid-template-columns:${layout === 'compact' ? '300px' : 'repeat(4, 150px)'};justify-content:space-between;row-gap:28px;padding:${layout === 'compact' ? 16 : 28}px;background:var(--ss-well);height:100%`}
    >
      {#each FRAMES as frame (frame)}
        {@const app = frame === 'soft' || frame === 'outline'}
        <div style="display:grid;gap:10px;justify-items:center;font:500 12px system-ui;color:var(--ss-text)">
          {#if layout === 'compact'}
            <div
              style={`display:flex;align-items:${app ? 'flex-start' : 'flex-end'};height:300px;overflow:hidden;padding-bottom:${app ? 0 : 12}px`}
            >
              {@render phoneFor(frame, app, 300)}
            </div>
          {:else}
            {@render phoneFor(frame, app, 150)}
          {/if}
          {frame}
        </div>
      {/each}
    </div>
  {/snippet}
</Stage>
