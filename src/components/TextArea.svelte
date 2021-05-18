<script lang="ts">
    export let value: string;
</script>

<textarea bind:value on:input />

<style>
    textarea {
        display: block;
        box-sizing: border-box;
        margin: 0;
        width: 100%;
        height: 256px;
        resize: none;
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
