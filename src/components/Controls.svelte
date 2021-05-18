<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Row from "./Row.svelte";
  import TextArea from "./TextArea.svelte";
  import Button from "./Button.svelte";
  import ButtonRow from "./ButtonRow.svelte";
  import LastFormulas from "./LastFormulas.svelte";
  import Accordion from "./Accordion.svelte";

  import { createGrammar } from "tracery-grammar";

  export let formula: string;
  export let time: number;
  export let min: number;
  export let max: number;
  export let paused: boolean;

  const dispatch = createEventDispatcher();

  let lastFormulas: string[] = [formula];

  function generateFormula(min: number) {
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
      ">>>",
      "%",
      ">",
      "<",
      "==",
      "!=",
    ],
    number: ["x", "y", "t", "random()", "127", "-127"],
  });

  const copyToBuffer = () => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete("formula");
    searchParams.append("formula", encodeURI(formula));
    console.log(searchParams);
    navigator.clipboard
      .writeText(
        window.location.hostname +
          (window.location.port.length ? ":" : "") +
          window.location.port +
          window.location.pathname +
          "?" +
          searchParams.toString()
      )
      .then(
        function () {
          console.log("Async: Copying to clipboard was successful!");
        },
        function (err) {
          console.error("Async: Could not copy text: ", err);
        }
      );
  };
</script>

<Row>
  <TextArea
    bind:value={formula}
    on:input={() => {
      time = 0;
    }}
  />
</Row>
<Row>
  <ButtonRow>
    <Button
      on:click={() => {
        dispatch("randomize");
        formula = generateFormula(75);
        lastFormulas = [formula, ...lastFormulas];
        time = 0;
      }}>randomize</Button
    >
    <Button on:click={copyToBuffer}>copy link</Button>
  </ButtonRow>
  <ButtonRow>
    <Button on:click={() => (paused = !paused)}>
      {paused ? "continue" : "pause"}</Button
    >
    <Button
      on:click={() => {
        paused = true;
        time++;
      }}>step</Button
    >
    <Button on:click={() => (time = 0)}>restart</Button>
  </ButtonRow>
</Row>
<Row>
  <div>min: {min}</div>
  <div>max: {max}</div>
  <div>time: {time}</div>
</Row>
<Row>
  <Accordion label="History">
    <LastFormulas
      bind:formulas={lastFormulas}
      on:clickFormula={e => {
        formula = e.detail.formula;
        time = 0;
      }}
    />
  </Accordion>
</Row>

<style>
  div {
    font-weight: bold;
  }
</style>
