<script lang="ts">
    import { afterUpdate, onMount } from "svelte";
    import { PixelsData, Rgba } from "./drawing";

    type GenerationResult = ReturnType<typeof generateData>;

    function generateData(
        width: number,
        height: number,
        time: number,
        formula: (x: number, y: number, t: number) => number
    ) {
        const resultData: number[][] = [];
        let min = Infinity;
        let max = -Infinity;
        let resultText = "Ok!";
        outer: for (let x = 0; x < width; x++) {
            resultData[x] = [];
            for (let y = 0; y < height; y++) {
                let result: number;
                try {
                    result = formula(x - width / 2, y - height / 2, time);
                } catch (error) {
                    for (let x2 = x; x2 < width; x2++) {
                        resultData[x] = [];
                        for (let y2 = 0; y2 < height; y2++) {
                            resultData[x][y] = 0;
                        }
                    }
                    resultText = error;
                    break outer;
                }
                resultData[x][y] = result;
                min = Math.min(min, result);
                max = Math.max(max, result);
            }
        }
        return { data: resultData, min, max, resultText };
    }

    function normalizeNumber(min: number, max: number, number: number): number {
        return (number - min) / (max - min);
    }

    function normalizeData(result: GenerationResult): number[][] {
        const newData: number[][] = [];
        for (let x = 0; x < result.data.length; x++) {
            newData[x] = [];
            for (let y = 0; y < result.data[0].length; y++) {
                newData[x][y] = normalizeNumber(
                    result.min,
                    result.max,
                    result.data[x][y]
                );
            }
        }
        return newData;
    }

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

    export let size: [number, number];
    export let drawingFunction: (x: number, y: number, t: number) => number;
    export let time: number;

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    onMount(() => {
        canvas.width = size[0] * 2;
        canvas.height = size[1] * 2;
        ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
    });

    afterUpdate(() => {
        const result = generateData(size[0], size[1], time, drawingFunction);
        const pixels = dataToImage(normalizeData(result));
        pixels.update();
        ctx.drawImage(pixels.node, 0, 0, canvas.width, canvas.height);
    });
</script>

<canvas bind:this={canvas} />

<style>
    canvas {
        border-radius: 5px;
        border: 1px solid #ccc;
        max-width: 512px;
    }
</style>
