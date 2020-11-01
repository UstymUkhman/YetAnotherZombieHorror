<div class="container">
  <div class="aim" />
</div>

<style lang="scss">
@import '@scss/variables';

div.container {
  position: absolute;
  display: block;
  margin: auto;
  padding: 0;

  height: 1vw;
  width: 1vw;

  bottom: 0;
  right: 0;
  left: 0;
  top: 0;

  div.aim {
    transition: transform 0.1s ease-out;
    transform-origin: center center;

    border: 2px solid $white;
    border-radius: 50%;

    position: absolute;
    display: block;

    height: 100%;
    width: 100%;

    left: -2px;
    top: -2px;

    padding: 0;
    margin: 0;
  }
}
</style>
