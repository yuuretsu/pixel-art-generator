import './style.css';

import { Canvas, PixelsData, Rgba } from "./drawing";
import { normalizeNumber } from "./math-functions";
import { createGrammar } from 'tracery-grammar';

const W = 256;
const H = 256;
const PX = 2;

const sin = Math.sin;
const asin = Math.asin;
const cos = Math.cos;
const acos = Math.acos;
const tan = Math.tan;
const tanh = Math.tanh;
const atan = Math.atan;
const hypot = Math.hypot;
const round = Math.round;
const ceil = Math.ceil;
const floor = Math.floor;
const rand = Math.random;
const abs = Math.abs;
const sqrt = Math.sqrt;
const cbrt = Math.cbrt;

const avg = (...args: number[]) => args.reduce((a, b) => a + b) / args.length;

function generate(min: number) {
    let result: string;
    do {
        result = grammar.flatten('#initial#');
    } while (result.length < min);
    return result;
}

function isBrucketsCorrect(data: string) {
    const warningField = document.getElementById("warning")!;
    let counter = 0;
    let isCorrect = true;
    for (let i = 0; i < data.length; i++) {
        if (data[i] == "(") {
            counter++;
        } else if (data[i] == ")") {
            counter--;
        }
        if (counter < 0) {
            isCorrect = false;
        }
    }
    console.log(counter);
    isCorrect = isCorrect && (counter == 0);
    if (!isCorrect) {
        warningField.innerText = " incorrect Bracket Sequences";
        return false;
    } else {
        warningField.innerText = "";
        return true;
    }


}

const grammar = createGrammar({
    'initial': ['#function#', '#number#'],
    'function': [
        '#func-1#(#initial#)',
        '#func-2#(#initial#, #initial#)',
        '#func-3#(#initial#, #initial#, #initial#)',
        '#initial# #operand# #initial#',
        '(#initial#)'
    ],
    'func-1': [
        'sin',
        'cos',
        'tan',
        'tanh',
        'asin',
        'acos',
        'atan',
        'round',
        'ceil',
        'floor',
        'abs'
    ],
    'func-2': ['hypot'],
    'func-3': ['hypot'],
    'operand': ['+', '-', '*', '/', '&', '|', '^', '&&', '||', '<<', '>>', '%', '>', '<', '=='],
    'number': ['x', 'y', 't']
});

onload = () => {

    function onInputFromula() {

        if (!isBrucketsCorrect(formulaInputNode.value)) { return };

        formula = eval(`(x, y, t) => ${formulaInputNode.value}`);
        t = 0;
    }

    const imgNode = document.querySelector<HTMLCanvasElement>('#img')!;
    const formulaInputNode = document
        .querySelector<HTMLInputElement>('#formula')!;
    formulaInputNode.oninput = onInputFromula;
    const randomNode = document.querySelector<HTMLButtonElement>('#generate-random')!;
    randomNode.onclick = () => {
        const randFormula = generate(50);
        formulaInputNode.value = randFormula;
        onInputFromula();
    };
    const minOutput = document.querySelector('#min')!;
    const maxOutput = document.querySelector('#max')!;
    const timeOutput = document.querySelector('#time')!;
    const errOutput = document.querySelector('#err')!;

    const canvas = new Canvas(
        W * PX,
        H * PX,
        imgNode
    );

    canvas.ctx.imageSmoothingEnabled = false;

    const pixels = new PixelsData(W, H);

    type Formula = (x: number, y: number, t: number) => number;

    let formula: Formula = eval(`(x, y, t) => ${formulaInputNode.value}`);

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
                    const result = formula((x - W / 2) || 1, (y - H / 2) || 1, t || 1);
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
        timeOutput.innerHTML = t.toString();

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