export default !document.getElementsByTagName('main').length ?
  import(TEST ? '@/components/Sandbox.svelte' : '@/App.svelte').then(
    Application => new Application.default({ target: document.body })
  ) : null;
