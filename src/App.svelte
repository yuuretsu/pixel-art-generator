<script lang="ts">
	import { onMount } from "svelte";
	import { generateFormula } from "./formula-randomizer";
	import FormulaVisualizator from "./FormulaVisualizator/index.svelte";
	import { formulaToFunction } from "./stringTools";

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

	function randomizeFormula() {
		textFormula = generateFormula(100);
		drawingFunction = formulaToFunction(textFormula);
	}

	let textFormula =
		"(hypot(x, y) > sin((x + y + t + random() * sin(x / 20) * 20) / 10) * 100) + (hypot(x, y) < sin((x + y + t + random() * sin(y / 30) * 30) / 10) * 100)";
	const urlParams = new URLSearchParams(window.location.search);
	let drawingFunction = urlParams.has("formula")
		? formulaToFunction(decodeURI(urlParams.get("formula")!))
		: formulaToFunction(textFormula);
	let time: number = 0;
	onMount(() => {
		(function loop() {
			time++;
			requestAnimationFrame(loop);
		})();
	});
</script>

<main>
	<FormulaVisualizator size={[256, 256]} {drawingFunction} {time} />
	<div class={"right"}>
		<textarea
			bind:value={textFormula}
			on:input={() => {
				time = 0;
				drawingFunction = formulaToFunction(textFormula);
				console.log(drawingFunction);
			}}
			cols="30"
			rows="10"
		/>
		<button on:click={randomizeFormula}>randomize</button>
		<button on:click={copyToBuffer}>copy link</button>
	</div>
</main>

<style>
	main {
		display: flex;
		justify-content: center;
	}

	textarea {
		display: block;
		resize: none;
		width: 100%;
		border-radius: 5px;
		margin-bottom: 10px;
	}

	button {
		border-radius: 5px;
		cursor: pointer;
		padding: 0.4em 1em;
	}

	button + button {
		margin-left: 5px;
	}

	button:hover {
		background-color: #e4e4e4;
	}

	button:focus {
		outline: none;
		border-color: #ccc;
	}

	.right {
		width: 514px;
		margin-left: 10px;
	}

	@media (max-width: 1100px) {
		main {
			display: block;
			text-align: center;
		}
		.right {
			margin: auto;
			margin-top: 10px;
			width: 514px;
		}
	}
</style>
