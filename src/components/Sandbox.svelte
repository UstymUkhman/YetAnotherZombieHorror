<Aim hide={!aiming} black />

<script lang="ts">
  import { GameEvents } from '@/events/GameEvents';
  import Aim from '@/components/HUD/Aim.svelte';
  import { onMount, onDestroy } from 'svelte';
  import WhiteBox from '@/scenes/WhiteBox';

  GameEvents.add('Player::Run', event => {
    const running = event.data as boolean;
    if (running) aiming = false;
  });

  GameEvents.add('Player::Aim', event =>
    aiming = event.data as boolean
  );

  onMount(() => box = new WhiteBox());

  onDestroy(() => {
    GameEvents.remove('Player::Run');
    GameEvents.remove('Player::Aim');

    box.dispose();
  });

  let box: WhiteBox;
  let aiming = true;
</script>
