<Aim hide={aiming} />

<script lang="ts">
  import { GameEvents } from '@/events/GameEvents';
  import Aim from '@components/HUD/Aim.svelte';
  import { Elastic } from '@/utils/Elastic';

  const zoom = new Elastic.Number(0);
  // let zoomScale: number;
  let aiming = false;

  GameEvents.add('Player::Run', event => {
    const running = event.data as boolean;
    if (running) aiming = true;
    zoom.set(+running * 0.5);
  });

  GameEvents.add('Player::Aim', event =>
    aiming = event.data as boolean
  );
</script>

<!-- <style lang="scss">
@use '@/variables' as var;
</style> -->
