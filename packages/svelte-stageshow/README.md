# svelte-stageshow

Svelte 5 port of Stageshow: framed faux product UI for stills and scripted
demos. Stage, Window, Bar, Text, Row, Phone, Avatar and Chip; one CSS import;
an Act scheduler with deterministic frame stepping.

```sh
pnpm add svelte-stageshow
```

```svelte
<script lang="ts">
  import { Avatar, Row, Stage, Window } from 'svelte-stageshow'
  import 'svelte-stageshow/style.css'
</script>

<Stage width={640} height={320} className="my-stage">
  {#snippet children(state, rect, layout)}
    <Window title="Customers" className="my-window">
      <Row selected title="Polaris Studio" subtitle="Scale · 24 seats">
        {#snippet lead()}<Avatar name="Polaris Studio" size={30} tone="accent" />{/snippet}
        {#snippet meta()}$12,400.00{/snippet}
      </Row>
    </Window>
  {/snippet}
</Stage>
```

The full README in the repository has the prop mapping (72 React prop names,
0 missing), the diff table, the deterministic `runFrames()` contract and the
verification record (`REHEARSAL.md`).

- Intended repository: `maven-ammar/svelte-stageshow` (private, not pushed yet)
- Licence: MIT, © 2026 Benji Taylor; Svelte port by Ammar (maven-ammar), 2026
- Peer: `svelte` ^5. No React, react-dom or icon dependency.
