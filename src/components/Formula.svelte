<script lang="ts">
  import { createEventDispatcher } from "svelte";
  export let formula: string;

  const dispatch = createEventDispatcher();
</script>

<div on:click={() => dispatch("clickFormula", { formula })}>{formula}</div>

<style>
  div {
    padding: 10px;
    font-weight: bold;
    cursor: pointer;
    font-size: 75%;
  }
  div:hover {
    color: white;
    background-color: #333;
  }
  div:not(:last-child) {
    border-bottom: 2px solid #333;
  }
  div:hover::-moz-selection {
    color: #333;
    background: white;
  }

  div:hover::selection {
    color: #333;
    background: white;
  }
</style>
