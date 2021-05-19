<script lang="ts">
</script>

<button on:click><slot /></button>

<style>
  button {
    font-family: inherit;
    border: 2px solid #333;
    border-radius: 0px;
    font-weight: bold;
    padding: 5px 10px;
    cursor: pointer;
    background-color: white;
    user-select: none;
    width: 100%;
    -webkit-tap-highlight-color: transparent;
    margin: 0;
  }
  button:active {
    color: white;
    background-color: #333;
  }
  button:not(:last-child) {
    margin-right: 10px;
  }
</style>
