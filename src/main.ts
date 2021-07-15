import Game from '@/Game.svelte';

// For some reason, production build runs this script twice,
// so we need to prevent creating a second instance of Game.
export default !document.getElementsByTagName('main').length
  ? new Game({ target: document.body }) : null;
