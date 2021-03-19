type GenerationResult = ReturnType<typeof generateData>;

export function generateData(
    width: number,
    height: number,
    time: number,
    formula: (x: number, y: number, t: number) => number
) {
    const resultData: number[][] = [];
    let min = Infinity;
    let max = -Infinity;
    let resultText = "Ok!";
    outer: for (let x = 0; x < width; x++) {
        resultData[x] = [];
        for (let y = 0; y < height; y++) {
            let result: number;
            try {
                result = formula(x - width / 2, y - height / 2, time);
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

function normalizeNumber(min: number, max: number, number: number): number {
    return (number - min) / (max - min);
}

export function normalizeData(result: GenerationResult): number[][] {
    const newData: number[][] = [];
    for (let x = 0; x < result.data.length; x++) {
        newData[x] = [];
        for (let y = 0; y < result.data[0].length; y++) {
            newData[x][y] = normalizeNumber(
                result.min,
                result.max,
                result.data[x][y]
            );
        }
    }
    return newData;
}