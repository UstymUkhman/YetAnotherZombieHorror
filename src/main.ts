import Application from '@/App.svelte';

TEST
  ? import('@/scenes/WhiteBox').then(WhiteBox => new WhiteBox.default())
  // For some reason, production build runs this script twice,
  // so we need to prevent creating a second instance of the Game.
  : document.getElementsByTagName('main').length ? null
  : new Application({ target: document.body });
