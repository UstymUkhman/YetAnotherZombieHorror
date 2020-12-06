<div style="transform: rotate({rotation}deg);"></div>

<script lang="typescript">
  export let rotation: number;
</script>

<style lang="scss">
@import '@/variables';

div {
  clip-path: polygon(50% 0, 100% 100%, 50% 75%, 0% 100%);
  background-color: $black;

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
}
</style>
