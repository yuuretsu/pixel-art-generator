<script lang="ts">
  export let label: string;
  export let opened = true;
</script>

<div class="head" on:click={() => (opened = !opened)}>
  <span>{label}</span><span>{opened ? "-" : "+"}</span>
</div>
{#if opened}
  <div class="body"><slot /></div>
{/if}

<style>
  .head {
    display: flex;
    justify-content: space-between;
    font-weight: bold;
    text-transform: uppercase;
    color: white;
    background-color: #333;
    padding: 5px 10px;
    user-select: none;
    cursor: pointer;
  }
  .body {
    font-weight: bold;
  }
</style>
