<script lang="ts">
	import { onMount } from "svelte";
	import { createGrammar } from "tracery-grammar";
	import FormulaVisualizator from "./FormulaVisualizator/index.svelte";

	function copyToBuffer() {
		const searchParams = new URLSearchParams(window.location.search);
		searchParams.delete("formula");
		searchParams.append("formula", encodeURI(formula));
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

	function generateFormula(min: number) {
		let result: string;
		do {
			result = grammar.flatten("#initial#");
		} while (result.length < min || result.length > 200);
		return result;
	}

	function randomizeFormula() {
		formula = generateFormula(100);
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
		"func-1": [
			"Math.sin",
			"Math.cos",
			"Math.tan",
			"Math.tanh",
			"Math.round",
			"Math.abs",
		],
		"func-2": ["Math.hypot", "Math.atan2"],
		"func-3": ["Math.hypot"],
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

	let formula =
		"(Math.hypot(x, y) > Math.sin((x + y + t + Math.random() * Math.sin(x / 20) * 20) / 10) * 100) + (Math.hypot(x, y) < Math.sin((x + y + t + Math.random() * Math.sin(y / 30) * 30) / 10) * 100)";

	let time: number = 0;
	onMount(() => {
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.has("formula")) {
			formula = decodeURI(urlParams.get("formula")!);
		}
		(function loop() {
			time++;
			requestAnimationFrame(loop);
		})();
	});
</script>

<main>
	<FormulaVisualizator size={[256, 256]} textFormula={formula} {time} />
	<div class={"right"}>
		<textarea bind:value={formula} cols="30" rows="10" />
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
