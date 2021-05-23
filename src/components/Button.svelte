<button on:click>{text}</button>

<script lang="typescript">
export let text: string;
</script>

<style lang="scss">
@import '@/variables';

button {
  transition: border-color 0.5s, color 0.5s;
  text-transform: uppercase;
  background-color: $black;
  border: solid 1px $grey;

  text-align: center;
  line-height: 25px;
  padding: 5px 20px;

  font-size: 1rem;
  cursor: pointer;

  height: 35px;
  outline: 0;

  &:hover {
    border-color: $red;
    color: $red;
  }
}
</style>
