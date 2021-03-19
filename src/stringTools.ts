import { parseScript } from "esprima";

type DrawingFunction = (x: number, y: number, t: number) => number;

const MATH_NAMES = Object.getOwnPropertyNames(Math);

export function translateFormula(formula: string): string {
    return formula
        .split(" ")
        .map((group) => {
            return group
                .split(",")
                .map((group2) => {
                    return group2
                        .split("(")
                        .map((str) =>
                            MATH_NAMES.includes(str) ? `Math.${str}` : str
                        )
                        .join("(");
                })
                .join(",");
        })
        .join(" ");
}

export function isValidFormula(formula: string) {
    let valid = true;
    try {
        parseScript(formula);
    } catch {
        valid = false;
    }
    return formula.length > 0 ? valid : false;
}

export function formulaToFunction(formula: string): DrawingFunction {
    return isValidFormula(formula)
        ? eval(`(x, y, t) => {
            let output = ${translateFormula(formula)};
            switch (output) {
                case Infinity: return Number.MAX_VALUE;
                case -Infinity: return Number.MIN_VALUE;
                case NaN: return 0;
                default: return output;
            }
        }`)
        : (_x, _y, _t) => 0;
}