<script lang="ts">
    import { afterUpdate, onMount } from "svelte";
    import { PixelsData, Rgba } from "./drawing";
    import { parseScript } from "esprima";

    type Formula = (x: number, y: number, t: number) => number;

    type GenerationResult = ReturnType<typeof generateData>;

    function generateData(
        width: number,
        height: number,
        time: number,
        formula: Formula
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

    function isValidFormula(formula: string) {
        let valid = true;
        try {
            parseScript(formula);
        } catch {
            valid = false;
        }
        return formula.length > 0 ? valid : false;
    }

    function getDrawingFunction(textFormula: string): Formula {
        Object.getOwnPropertyNames(Math).forEach((key) => {
            textFormula = textFormula.replaceAll(key, `Math.${key}`);
        });
        textFormula = textFormula.replaceAll("Math.Math.", "Math.");
        return isValidFormula(textFormula)
            ? eval(`(x, y, t) => {
            let output = ${textFormula};
            switch (output) {
                case Infinity: return Number.MAX_VALUE;
                case -Infinity: return Number.MIN_VALUE;
                case NaN: return 0;
                default: return output;
            }
        }`)
            : (_x, _y, _t) => 0;
    }

    export let size: [number, number];
    export let textFormula: string;
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
        const formula = getDrawingFunction(textFormula);
        const result = generateData(size[0], size[1], time, formula);
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
    }
</style>
