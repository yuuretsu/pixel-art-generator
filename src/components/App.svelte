<script lang="ts">
  import FormulaChecker from "./FormulaChecker.svelte";
  import Controls from "./Controls.svelte";
  import { afterUpdate } from "svelte";

  const urlParams = new URLSearchParams(window.location.search);
  let formula = urlParams.has("formula")
    ? decodeURI(urlParams.get("formula")!)
    : "(hypot(x, y) > sin((x + y + t + random() * sin(x / 20) * 20) / 10) * 100) + (hypot(x, y) < sin((x + y + t + random() * sin(y / 30) * 30) / 10) * 100)";

  let time = 0;
  let min: number = Infinity;
  let max: number = -Infinity;
  let paused: boolean = false;
  let interval: number | null = null;

  afterUpdate(() => {
    if (interval !== null) {
      clearInterval(interval);
      interval = null;
    }
    if (!paused) interval = setInterval(() => time++);
  });
</script>

<main>
  <div class="image-wrapper">
    <FormulaChecker bind:formula bind:time bind:min bind:max />
  </div>
  <div class="controls-wrapper">
    <Controls bind:formula bind:paused bind:time bind:min bind:max />
  </div>
</main>

<style>
  main {
    box-sizing: border-box;
    display: flex;
    max-width: calc(516px * 2 + 30px);
    margin: 0 auto;
    padding: 10px;
  }
  .image-wrapper,
  .controls-wrapper {
    box-sizing: border-box;
    width: 516px;
  }
  .image-wrapper {
    margin-right: 10px;
  }
  @media (max-width: 1058px) {
    main {
      max-width: calc(516px + 20px);
      display: block;
    }
    .image-wrapper,
    .controls-wrapper {
      width: 100%;
    }
    .image-wrapper {
      margin-right: 0px;
      margin-bottom: 10px;
    }
  }
</style>
