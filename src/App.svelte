<script lang="ts">
	import { generateFormula } from "./formula-randomizer";
	import FormulaVisualizator from "./FormulaVisualizator/index.svelte";
	import { formulaToFunction } from "./stringTools";
	import { generateData, normalizeData } from "./data-generator";

	function copyToBuffer() {
		const searchParams = new URLSearchParams(window.location.search);
		searchParams.delete("formula");
		searchParams.append("formula", encodeURI(textFormula));
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
	}

	function updateImage() {
		data = generateData(
			dataSize || 256,
			dataSize || 256,
			time,
			drawingFunction
		);
	}

	function randomizeFormula() {
		textFormula = generateFormula(100);
		drawingFunction = formulaToFunction(textFormula);
		updateImage();
		time = 0;
	}

	function step() {
		time++;
		updateImage();
	}

	const urlParams = new URLSearchParams(window.location.search);
	let textFormula = urlParams.has("formula")
		? decodeURI(urlParams.get("formula")!)
		: "(hypot(x, y) > sin((x + y + t + random() * sin(x / 20) * 20) / 10) * 100) + (hypot(x, y) < sin((x + y + t + random() * sin(y / 30) * 30) / 10) * 100)";
	let drawingFunction = formulaToFunction(textFormula);
	let time = 0;
	let update = true;
	let data: {
		data: number[][];
		min: number;
		max: number;
		resultText: string;
	};
	let dataSize = 256;
	updateImage();
	(function loop() {
		if (update) step();
		requestAnimationFrame(loop);
	})();
</script>

<main class="container">
	<div class="column">
		<FormulaVisualizator data={normalizeData(data)} />
	</div>
	<div class="column">
		<div class="column__row">
			<textarea
				class="formula-input"
				bind:value={textFormula}
				on:input={() => {
					time = 0;
					drawingFunction = formulaToFunction(textFormula);
				}}
			/>
		</div>
		<div class="column__row">
			Image size:
			<input type="number" bind:value={dataSize} />
		</div>
		<div class="column__row">
			<button on:click={randomizeFormula}>randomize</button>
			<button on:click={copyToBuffer}>copy link</button>
		</div>
		<div class="column__row">
			<button on:click={() => (update = update ? false : true)}>
				{#if update}pause{:else}continue{/if}
			</button>
			<button
				on:click={() => {
					update = false;
					step();
				}}>step</button
			>
			<button
				on:click={() => {
					time = 0;
					updateImage();
				}}>clear time</button
			>
		</div>
		<div class="column__row">
			<div>min: {data.min}</div>
			<div>max: {data.max}</div>
			<div>time: {time}</div>
		</div>
	</div>
</main>

<style>
	@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Mono&display=swap");
	button,
	textarea {
		font-size: inherit;
	}
	button {
		padding: 5px 10px;
		border-radius: 5px;
		border: 1px solid rgb(150, 150, 150);
		background-color: #efefef;
		cursor: pointer;
		margin: 0;
		-webkit-user-select: none;
		-moz-user-select: none;
	}
	button + button {
		margin-left: 5px;
	}
	button:focus {
		outline: none;
	}
	input[type="number"] {
		width: 50px;
	}
	.container {
		display: flex;
		max-width: calc(512px + 512px + 10px);
		margin: 0 auto;
		padding: 10px;
	}
	.column {
		width: 100%;
		max-width: 512px;
	}
	.column + .column {
		margin-left: 10px;
	}
	.column__row + .column__row {
		margin-top: 10px;
	}
	.formula-input {
		display: block;
		font-family: "IBM Plex Mono", monospace;
		box-sizing: border-box;
		background-color: #efefef;
		width: 100%;
		padding: 10px;
		height: 256px;
		resize: none;
		border-radius: 5px;
		border: none;
		box-shadow: inset 0 0 0 1px rgb(150, 150, 150);
		transition-duration: 0.2s;
	}
	.formula-input:focus {
		box-shadow: inset 0 0 0 3px rgb(150, 150, 150);
		outline: none;
	}
	@media (max-width: 1054px) {
		button {
			padding: 10px 20px;
		}
		.container {
			max-width: 512px;
			display: block;
		}
		.column {
			width: 100%;
			min-width: auto;
		}
		.column + .column {
			margin-left: 0;
			margin-top: 10px;
		}
		.formula-input {
			height: 128px;
		}
	}
</style>
