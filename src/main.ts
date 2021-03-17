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
const atan = Math.atan;
const hypot = Math.hypot;
const round = Math.round;
const rand = Math.random;
const abs = Math.abs;
const sqrt = Math.sqrt;
const cbrt = Math.cbrt;

const avg = (...args: number[]) => args.reduce((a, b) => a + b) / args.length;

function generate(min: number) {
    let result: string;
    do {
        result = grammar.flatten('#formula#');
    } while (result.length < min);
    return result;
}

function encoded(s: string) {
    s.replace("+", encodeURI("+")).replace("=", encodeURI("=")).replace("&", encodeURI("&")).replace("?", encodeURI("?")).replace("%", encodeURI("%"));
    return s;
}

function copyToBuffer() {
    let formulaInputNode = document
        .querySelector<HTMLInputElement>('#formula')!;
    var searchParams = new URLSearchParams(window.location.search);
    searchParams.delete("formula");
    searchParams.append("formula",encodeURI(formulaInputNode.value) );
    navigator.clipboard.writeText(window.location.hostname + (window.location.port.length ? ":" : "") + window.location.port  + window.location.pathname  + "?" +  searchParams.toString()).then(function() {
        console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
        console.error('Async: Could not copy text: ', err);
    });
}

function isBrucketsCorrect(data: string){
    const warningField = document.getElementById("warning")!;
    let counter = 0;
    let isCorrect = true;
    for (let i = 0; i < data.length; i++){
        if (data[i] == "("){
            counter++;
        } else if (data[i] == ")"){
            counter--;
        }
        if (counter < 0){
            isCorrect = false;
        }
    }
    console.log(counter);
    isCorrect = isCorrect && (counter == 0);
    if (!isCorrect){
        warningField.innerText = " incorrect Bracket Sequences";
        return false;
    } else {
        warningField.innerText = "";
        return true;
    }


}

const grammar = createGrammar({
    'formula': ['#formula# #operator# #formula#', '#func#', '#number#', '#number#'],
    'func': ['#func_1#', '#func_2#'],
    'func_1': ['sin(#formula#)', 'cos(#formula#)', 'abs(#formula#)'],
    'func_2': ['hypot(#formula#, #formula#)'],
    'number': ['rand()', 'x', 'y', 't'],
    'operator': ['+', '-', '*', '/', '==', '>', '<', '&', '|', '^', '%'],
});

onload = () => {

    function onInputFromula() {

        if (!isBrucketsCorrect(formulaInputNode.value)) { return };

        eval(`formula = (x, y) => ${formulaInputNode.value}`);
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
    const share = document.querySelector<HTMLButtonElement>('#share')!;
    share.onclick = copyToBuffer;
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

    let formula: (x: number, y: number, t: number, i: number) => number;
    const urlParams = new URLSearchParams(window.location.search );
    if ( urlParams.has("formula")){
        formulaInputNode.value = decodeURI(urlParams.get("formula")!);
        eval(`formula = (x, y, t, i) => ${decodeURI(urlParams.get("formula")!)}`);
    } else {
        eval(`formula = (x, y, t, i) => ${formulaInputNode.value}`);
    }

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
                    const result = formula(x - W / 2, y - H / 2, t, x + y * W);
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