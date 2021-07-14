import Game from '@/Game.svelte';

export default !document.getElementsByTagName('main').length
  ? new Game({ target: document.body }) : null;
