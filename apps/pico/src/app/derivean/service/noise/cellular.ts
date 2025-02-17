import { FastNoiseLite } from "@use-pico/common";
import { createNoise } from "~/app/derivean/service/noise/createNoise";

export const cellular = (seed: string) => {
	const noise = createNoise({ seed });
	noise.SetNoiseType(FastNoiseLite.NoiseType.Cellular);
	noise.SetCellularDistanceFunction(
		FastNoiseLite.CellularDistanceFunction.EuclideanSq,
	);
	noise.SetCellularReturnType(FastNoiseLite.CellularReturnType.Distance2);
	noise.SetFractalType(FastNoiseLite.FractalType.DomainWarpIndependent);

	return (x: number, z: number) => {
		return noise.GetNoise(x, z);
	};
};
