import Game from '@/Game.svelte';

// For some reason, production build runs this script twice,
// so we need to prevent creating a second instance of the Game.
export default !document.getElementById('main')
  ? new Game({ target: document.body }) : null;
