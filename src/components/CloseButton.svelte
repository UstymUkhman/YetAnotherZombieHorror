<div id="close-button" on:click|preventDefault|stopPropagation={closeApp}>
  <h3>&#x2718;</h3>
</div>

<script lang="typescript">
export const closeApp = (): void => {
  window.close();
}
</script>

<style lang="scss">
div#close-button {
  position: absolute;
  cursor: pointer;
  display: block;

  height: 50px;
  width: 50px;

  right: 0;
  top: 0;

  h3 {
    position: absolute;
    line-height: 1;

    right: 2px;
    top: 4px;
  }
}
</style>
