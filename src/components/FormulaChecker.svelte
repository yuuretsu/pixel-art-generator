<script lang="ts">
  import FormulaVisualizator from "./FormulaVisualizator.svelte";
  import { parseScript } from "esprima";
  import { afterUpdate } from "svelte";

  export let formula: string;
  export let time: number;
  export let min: number;
  export let max: number;

  type DrawingFn = (x: number, y: number, t: number) => number;

  const MATH_NAMES = Object.getOwnPropertyNames(Math);

  const translateFormula = (formula: string) => {
    return formula
      .split(" ")
      .map(group =>
        group
          .split(",")
          .map(group2 =>
            group2
              .split("(")
              .map(str => (MATH_NAMES.includes(str) ? `Math.${str}` : str))
              .join("(")
          )
          .join(",")
      )
      .join(" ");
  };

  const prepareFormula = (formula: string): DrawingFn | Error => {
    if (formula.length < 1) return new Error("Empty formula");
    const translated = translateFormula(formula);
    try {
      parseScript(translated);
    } catch (e) {
      return e;
    }
    let drawingFn: Function;
    try {
      drawingFn = new Function(
        "x",
        "y",
        "t",
        `let output = ${translated};
        if (isNaN(output)) return 0;
        switch (output) {
          case Infinity: return Number.MAX_VALUE;
          case -Infinity: return Number.MIN_VALUE;
          default: return output;
        }`
      ) as DrawingFn;
    } catch (e) {
      return e;
    }
    try {
      const test = drawingFn(0, 0, 0);
      if (!["number", "boolean"].includes(typeof test))
        return new Error(`Bad function`);
    } catch (e) {
      return e;
    }
    return drawingFn as DrawingFn;
  };

  let result: DrawingFn | Error;

  $: {
    result = prepareFormula(formula);
  }
</script>

{#if typeof result === "function"}
  <FormulaVisualizator bind:drawingFn={result} bind:time bind:min bind:max />
{:else}
  <div class="outer">
    <div class="inner">
      {result}
    </div>
  </div>
{/if}

<style>
  .outer {
    border: 2px solid #333;
    position: relative;
  }
  .outer:after {
    content: "";
    display: block;
    padding-bottom: 100%;
  }
  .inner {
    box-sizing: border-box;
    position: absolute;
    width: 100%;
    height: 100%;
    font-weight: bold;
    padding: 10px;
  }
</style>
