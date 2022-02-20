<button on:click>{text}</button>

<script lang="ts">
  export let text: string;
</script>

<style lang="scss">
  @use "@/mixins" as mixin;
  @use "@/variables" as var;

  button {
    transition: border-color 0.5s, color 0.5s;
    background-color: var.$black;
    border: solid 1px var.$grey;

    @include mixin.cursor(true);
    text-transform: uppercase;

    text-align: center;
    line-height: 25px;
    padding: 5px 20px;
    font-size: 1rem;

    height: 35px;
    outline: 0;

    &:hover {
      border-color: var.$red;
      color: var.$red;
    }
  }
</style>
