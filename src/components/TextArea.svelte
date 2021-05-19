<script lang="ts">
  export let value: string;
</script>

<textarea bind:value on:input />

<style>
  textarea {
    -webkit-appearance: none;
    display: block;
    box-sizing: border-box;
    margin: 0;
    width: 100%;
    height: 128px;
    resize: vertical;
    border: 2px solid #333;
    border-radius: 0px;
    font-family: inherit;
    font-weight: bold;
    padding: 10px;
  }
  textarea:focus {
    outline: none;
    border: 2px solid #333;
    border-radius: 0px;
  }
</style>
