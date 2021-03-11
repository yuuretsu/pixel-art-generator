import './style.css';

import { Canvas, PixelsData, Rgba } from "./drawing";
import { normalizeNumber } from "./math-functions";

const W = 256;
const H = 256;
const PX = 2;

const sin = Math.sin;
const asin = Math.asin;
const cos = Math.cos;
const acos = Math.acos;
const tan = Math.tan;
const atan = Math.atan;
const hypot = Math.hypot;
const round = Math.round;
const rand = Math.random;
const abs = Math.abs;
const sqrt = Math.sqrt;
const cbrt = Math.cbrt;

const avg = (...args: number[]) => args.reduce((a, b) => a + b) / args.length;

onload = () => {

    const imgNode = document.querySelector<HTMLCanvasElement>('#img')!;
    const formulaInputNode = document.querySelector<HTMLInputElement>('#formula')!;
    formulaInputNode.oninput = () => {
        eval(`formula = (x, y) => ${formulaInputNode.value}`);
        t = 0;
    };
    const minOutput = document.querySelector('#min')!;
    const maxOutput = document.querySelector('#max')!;
    const errOutput = document.querySelector('#err')!;

    const canvas = new Canvas(
        W * PX,
        H * PX,
        imgNode
    );

    canvas.ctx.imageSmoothingEnabled = false;

    const pixels = new PixelsData(W, H);

    let formula: (x: number, y: number, t: number) => number;

    eval(`formula = (x, y, t) => ${formulaInputNode.value}`);

    let t = 0;
    setInterval(() => {

        const results: number[][] = [];

        let min = Infinity;
        let max = -Infinity;

        try {
            errOutput.innerHTML = '';
            for (let x = 0; x < W; x++) {
                results[x] = [];
                for (let y = 0; y < H; y++) {
                    const result = formula(x - W / 2, y - H / 2, t);
                    results[x][y] = result;
                    min = Math.min(min, result);
                    max = Math.max(max, result);
                }
            }
        } catch (e) {
            errOutput.innerHTML = e;
        }

        minOutput.innerHTML = min.toString();
        maxOutput.innerHTML = max.toString();

        for (let x = 0; x < W; x++) {
            for (let y = 0; y < H; y++) {
                const B = normalizeNumber(min, max, results[x][y]);
                pixels.setPixel(x, y, new Rgba(0, 0, 0, 255).interpolate(new Rgba(255, 255, 255, 255), B));
            }
        }

        pixels.update();
        canvas.ctx.drawImage(
            pixels.node,
            0,
            0,
            canvas.node.width, canvas.node.height
        );

        t += 1;
    });

};