import { createGrammar } from "tracery-grammar";

export function generateFormula(min: number) {
    let result: string;
    do {
        result = grammar.flatten("#initial#");
    } while (result.length < min || result.length > 200);
    return result;
}

const grammar = createGrammar({
    initial: ["#function#", "#number#"],
    function: [
        "#func-1#(#initial#)",
        "#func-2#(#initial#, #initial#)",
        "#func-3#(#initial#, #initial#, #initial#)",
        "#initial# #operand# #initial#",
        "(#initial#)",
    ],
    "func-1": ["sin", "cos", "tan", "tanh", "round", "abs"],
    "func-2": ["hypot", "atan2"],
    "func-3": ["hypot"],
    operand: [
        "+",
        "-",
        "*",
        "/",
        "&",
        "|",
        "^",
        "&&",
        "||",
        "<<",
        ">>",
        "%",
        ">",
        "<",
        "==",
        "!=",
    ],
    number: ["x", "y", "t"],
});