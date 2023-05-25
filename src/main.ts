export default document.getElementById('root') ? null :
  import(TEST ? '@/components/Sandbox.svelte' : '@/App.svelte')
    .then(App => new App.default({ target: document.body }));
