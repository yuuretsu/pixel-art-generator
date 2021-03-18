import { Canvas, PixelsData, Rgba } from "./drawing";
import { createGrammar } from 'tracery-grammar';
import { parseScript } from 'esprima';
import { normalizeNumber } from "./math-functions";

type Formula = (x: number, y: number, t: number) => number;

type GenerationResult = ReturnType<typeof generateData>;

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

function normalizeData(result: GenerationResult): number[][] {
    const newData: number[][] = [];
    for (let x = 0; x < result.data.length; x++) {
        newData[x] = [];
        for (let y = 0; y < result.data[0].length; y++) {
            newData[x][y] = normalizeNumber(result.min, result.max, result.data[x][y]);
        }
    }
    return newData;
}

function generateData(
    width: number,
    height: number,
    time: number,
    formula: Formula
) {
    const resultData: number[][] = [];
    let min = Infinity;
    let max = -Infinity;
    let resultText = 'Ok!';
    outer: for (let x = 0; x < width; x++) {
        resultData[x] = [];
        for (let y = 0; y < height; y++) {
            let result: number;
            try {
                result = formula(
                    (x - W / 2) || 1,
                    (y - H / 2) || 1,
                    time || 1
                );
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

function generateFormula(min: number) {
    let result: string;
    do {
        result = grammar.flatten('#initial#');
    } while (
        result.length < min || result.length > 200
    );
    return result;
}

function copyToBuffer() {
    const formulaInputNode = document
        .querySelector<HTMLInputElement>('#formula')!;
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete("formula");
    searchParams.append("formula", encodeURI(formulaInputNode.value));
    navigator.clipboard.writeText(
        window.location.hostname +
        (window.location.port.length ? ":" : "") +
        window.location.port +
        window.location.pathname + "?" +
        searchParams.toString()
    ).then(function () {
        console.log('Async: Copying to clipboard was successful!');
    }, function (err) {
        console.error('Async: Could not copy text: ', err);
    });
}

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
const atan2 = Math.atan2;
const hypot = Math.hypot;
const round = Math.round;
const ceil = Math.ceil;
const floor = Math.floor;
const rand = Math.random;
const abs = Math.abs;
const sqrt = Math.sqrt;
const cbrt = Math.cbrt;

const avg = (...args: number[]) => args.reduce((a, b) => a + b) / args.length;

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
        // 'asin',
        // 'atan',
        'round',
        'abs',
        'avg'
    ],
    'func-2': ['hypot', 'avg', 'atan2'],
    'func-3': ['hypot', 'avg'],
    'operand': [
        '+',
        '-',
        '*',
        '/',
        '&',
        '|',
        '^',
        '&&',
        '||',
        '<<',
        '>>',
        '%',
        '>',
        '<',
        '=='
    ],
    'number': ['x', 'y', 't']
});

window.addEventListener('load', () => {
    function onInputFormula() {
        formula = getDrawingFunction(formulaInputNode.value);
        time = 0;
    }

    const canvas = new Canvas(
        W * PX,
        H * PX,
        document.querySelector<HTMLCanvasElement>('#img')!
    );
    canvas.ctx.imageSmoothingEnabled = false;
    const formulaInputNode = document.querySelector<HTMLTextAreaElement>('#formula')!;
    formulaInputNode.addEventListener('input', onInputFormula);

    const generateRandom = document.querySelector<HTMLButtonElement>('#generate-random')!;
    generateRandom.addEventListener('click', () => {
        const randFormula = generateFormula(100);
        formulaInputNode.value = randFormula;
        onInputFormula();
    });
    document.querySelector<HTMLButtonElement>('#share')!
        .addEventListener('click', copyToBuffer);

    const minOutput = document.querySelector('#min')!;
    const maxOutput = document.querySelector('#max')!;
    const timeOutput = document.querySelector('#time')!;
    const resultOutput = document.querySelector('#result')!;

    let formula = getDrawingFunction(formulaInputNode.value);
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("formula")) {
        formulaInputNode.value = decodeURI(urlParams.get("formula")!);
        formula = getDrawingFunction(decodeURI(urlParams.get("formula")!));
    } else {
        formula = getDrawingFunction(formulaInputNode.value);
    }

    let time = 0;
    setInterval(() => {
        const result = generateData(W, H, time, formula);
        minOutput.innerHTML = result.min.toString();
        maxOutput.innerHTML = result.max.toString();
        timeOutput.innerHTML = time.toString();
        resultOutput.innerHTML = result.resultText;
        const pixels = dataToImage(normalizeData(result));
        canvas.ctx.drawImage(
            pixels.node,
            0,
            0,
            canvas.node.width, canvas.node.height
        );
        time++;
    });
});