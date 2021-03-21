<script lang="ts">
    import { afterUpdate, onMount } from "svelte";
    import { PixelsData, Rgba } from "./drawing";

    function dataToImage(data: number[][]) {
        const pixels = new PixelsData(data.length, data[0].length);
        for (let x = 0; x < data.length; x++) {
            for (let y = 0; y < data[0].length; y++) {
                const B = data[x][y] * 255;
                pixels.setPixel(x, y, new Rgba(B, B, B, 255));
            }
        }
        pixels.update();
        return pixels;
    }
    export let data: number[][];

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    onMount(() => {
        canvas.width = 512;
        canvas.height = 512;
        ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
    });

    afterUpdate(() => {
        const pixels = dataToImage(data);
        pixels.update();
        ctx.drawImage(pixels.node, 0, 0, canvas.width, canvas.height);
    });
</script>

<canvas bind:this={canvas} />

<style>
    canvas {
        display: block;
        border-radius: 5px;
        max-width: 100%;
        margin: auto;
    }
</style>
