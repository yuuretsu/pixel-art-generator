<script lang="ts">
  import Formula from "./Formula.svelte";
  export let formulas: string[] = [];
</script>

<div>
  {#each formulas as formula}
    <Formula {formula} on:clickFormula />
  {/each}
</div>

<style>
</style>
