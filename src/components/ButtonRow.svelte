<script lang="ts">
</script>

<div><slot /></div>

<style>
  div {
    display: flex;
  }
  div:not(:last-child) {
    margin-bottom: 10px;
  }
</style>
