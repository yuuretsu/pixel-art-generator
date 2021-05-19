<script lang="ts">
  import { afterUpdate, onMount } from "svelte";

  export let drawingFn: (x: number, y: number, t: number) => number = (
    x,
    y,
    t
  ) => x ^ (y + t);
  export let time: number;
  export let min: number;
  export let max: number;

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  const image = document.createElement("canvas");
  image.width = 256;
  image.height = 256;
  const ictx = image.getContext("2d")!;
  ictx.fillStyle = "#333";
  ictx.fillRect(0, 0, 256, 256);
  const data = ictx.getImageData(0, 0, image.width, image.height);

  onMount(() => {
    ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
  });

  afterUpdate(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    min = Infinity;
    max = -Infinity;
    const pixelsData: number[] = [];
    for (let x = 0; x < image.width; x++) {
      for (let y = 0; y < image.height; y++) {
        const result = drawingFn(
          x - image.width / 2,
          y - image.height / 2,
          time
        );
        min = Math.min(min, result);
        max = Math.max(max, result);
        pixelsData.push(result);
      }
    }
    pixelsData.forEach(
      (v, i) => (data.data[i * 4 + 3] = ((v - min) / (max - min)) * 255)
    );
    ictx.putImageData(data, 0, 0);
    ctx.drawImage(image, 0, 0, 512, 512);
  });
</script>

<canvas bind:this={canvas} width={512} height={512} />

<style>
  canvas {
    box-sizing: border-box;
    display: block;
    width: 100%;
    background-color: transparent;
    border: 2px solid #333;
    image-rendering: pixelated;
  }
</style>
