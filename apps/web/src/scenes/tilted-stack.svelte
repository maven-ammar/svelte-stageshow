<script lang="ts">
  import { Bar, Stage, Text } from 'svelte-stageshow'
  import './tilted-stack.css'
</script>

<Stage width={480} height={360} compact={{ below: 480, width: 358, height: 340 }} className="ts">
  {#snippet children()}
    <div class="ts-pile">
      <section class="ts-card ts-card--back">
        <Bar w={90} h={9} r={4.5} tone={3} />
        <Bar w={130} h={7} r={3.5} tone={2} />
        <Bar w={110} h={7} r={3.5} tone={2} />
      </section>
      <section class="ts-card ts-card--mid">
        <Bar w={110} h={9} r={4.5} tone={3} />
        <Bar w={150} h={7} r={3.5} tone={2} />
        <Bar w={120} h={7} r={3.5} tone={2} />
      </section>
      <section class="ts-card ts-card--top">
        <Text className="ts-merchant">Lumen Coffee</Text>
        <Text className="ts-date">Oct 28, 9:14 AM</Text>
        <div class="ts-items">
          <div class="ts-item"><Text>Flat white</Text><Text>$4.50</Text></div>
          <div class="ts-item"><Text>Almond croissant</Text><Text>$3.75</Text></div>
        </div>
        <div class="ts-total"><Text>Total</Text><Text>$8.25</Text></div>
      </section>
    </div>
  {/snippet}
</Stage>
