import Application from '@/App.svelte';

// For some reason, production build runs this script twice,
// so we need to prevent creating a second instance of the Game.
export default !document.getElementsByTagName('main').length
  ? new Application({ target: document.body }) : null;
