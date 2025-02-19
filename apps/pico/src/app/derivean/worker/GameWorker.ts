import { hexToRGB, Timer } from "@use-pico/common";
import { deserialize, serialize } from "borsh";
import { expose, transfer } from "comlink";
import { decompressSync, deflateSync } from "fflate";
import { dir, file, write } from "opfs-tools";
import { Game } from "~/app/derivean/Game";
import type { Chunks } from "~/app/derivean/map/Chunks";
import { withLandNoise } from "~/app/derivean/map/noise/withLandNoise";
import { ChunkBorshSchema } from "~/app/derivean/service/generator/ChunkBorshSchema";
import { withColorMap } from "~/app/derivean/service/generator/withColorMap";
import { withGenerator } from "~/app/derivean/service/generator/withGenerator";
import type { Texture } from "~/app/derivean/Texture";

/**
 * Complicated, because of async functions.
 */
const chunkHits = new Int32Array(new SharedArrayBuffer(4));
let chunksAbortController = new AbortController();

const cancelChunks = () => {
	console.log("Canceling chunks");
	chunksAbortController.abort();
};

const chunks = async (
	id: string,
	seed: string,
	minX: number,
	maxX: number,
	minZ: number,
	maxZ: number,
	count: number,
	hash: string,
) => {
	const timer = new Timer();
	timer.start();

	chunksAbortController = new AbortController();

	console.log(`Generating ${count} chunks, ${hash}`);

	Atomics.store(chunkHits, 0, 0);

	const generator = withGenerator({
		plotCount: Game.plotCount,
		plotSize: Game.plotSize,
		seed,
		scale: 1,
		noise({ seed }) {
			return {
				land: withLandNoise({ seed }),
			};
		},
		tile: {
			id: "grass",
			chance: 100,
			color: "#00FF00",
			noise: 1,
		},
		layers() {
			return [];
		},
	});

	await dir(`/chunk/${id}`).create();

	const chunks = new Array<Promise<Chunks.Chunk>>(count);

	try {
		let index = 0;
		for (let x = minX; x < maxX; x++) {
			for (let z = minZ; z < maxZ; z++) {
				if (chunksAbortController.signal.aborted) {
					console.warn("\t - Chunks aborted");
					chunksAbortController = new AbortController();
					return [];
				}

				chunks[index++] = (async (): Promise<Chunks.Chunk> => {
					const chunkId = `${x}:${z}`;
					const chunkFile = `/chunk/${id}/${chunkId}.borsh`;

					/**
					 * File reading does not throw an error, so it's necessary to check
					 * for existence.
					 */
					if (await file(chunkFile).exists()) {
						const data = deserialize(
							ChunkBorshSchema,
							decompressSync(
								new Uint8Array(await file(chunkFile).arrayBuffer()),
							),
						) as Chunks.Chunk;

						Atomics.add(chunkHits, 0, 1);

						return data;
					}

					const data = {
						id: chunkId,
						x,
						z,
						tiles: generator({ x, z }),
					} as const;

					write(
						chunkFile,
						deflateSync(serialize(ChunkBorshSchema, data), { level: 9 }),
					);

					return data;
				})();
			}
		}
	} catch (e) {
		console.error(e);
		throw e;
	}

	return Promise.all<Chunks.Chunk>(chunks)
		.catch((e) => {
			console.error(e);
		})
		.then((data) => {
			console.log(
				`\t- Chunks finished [hit ${Atomics.load(chunkHits, 0)}/${count}] [${timer.format()}]`,
			);
			return data as Chunks.Chunk[];
		});
};

const textureHits = new Int32Array(new SharedArrayBuffer(4));
let texturesAbortController = new AbortController();

const cancelTextures = () => {
	console.log("Canceling textures");
	texturesAbortController.abort();
};

const textures = async (
	id: string,
	chunks: Chunks.Chunk[],
	chunkSize: number,
	hash: string,
	colorMap: readonly { color: string }[],
) => {
	const timer = new Timer();
	timer.start();

	texturesAbortController = new AbortController();

	console.log(`Generating ${chunks.length} textures, ${hash}`);

	await dir(`/texture/${id}`).create();

	const textures: Record<string, Texture> = {};
	const transfers: ArrayBufferLike[] = [];
	const colorBuffers = new Map<string, Uint8Array>();

	Atomics.store(textureHits, 0, 0);

	for (const { color } of colorMap.values()) {
		const { r, g, b } = hexToRGB(color);

		const length = Game.plotSize * 3;
		const buffer = new Uint8Array(length);
		for (let i = 0; i < length; i += 3) {
			buffer[i] = r;
			buffer[i + 1] = g;
			buffer[i + 2] = b;
		}
		colorBuffers.set(color, buffer);
	}

	for (const chunk of chunks) {
		if (texturesAbortController.signal.aborted) {
			console.warn("\t - Textures aborted");
			texturesAbortController = new AbortController();
			return [];
		}

		const textureFile = `/texture/${id}/${chunk.id}.bin`;

		// if (await file(textureFile).exists()) {
		// 	const data = new Uint8ClampedArray(
		// 		decompressSync(new Uint8Array(await file(textureFile).arrayBuffer())),
		// 	);

		// 	textures[chunk.id] = {
		// 		width: chunkSize,
		// 		height: chunkSize,
		// 		data: data.buffer,
		// 	};
		// 	transfers.push(data.buffer);

		// 	Atomics.add(textureHits, 0, 1);
		// 	continue;
		// }

		const buffer = new Uint8Array(chunkSize * chunkSize * 3);

		for (const tile of chunk.tiles) {
			if (texturesAbortController.signal.aborted) {
				console.warn("\t - Textures aborted");
				break;
			}

			const color = colorBuffers.get(
				withColorMap({ value: tile.noise, levels: Game.colorMap }),
			)!;

			const startX = tile.pos.x;
			const startZ = tile.pos.z;

			const destIndex = (startZ * chunkSize + startX) * 3;

			for (let row = 0; row < Game.plotSize; row++) {
				buffer.set(color, destIndex + row * chunkSize * 3);
			}
		}

		textures[chunk.id] = {
			width: chunkSize,
			height: chunkSize,
			data: buffer.buffer,
		};
		transfers.push(buffer.buffer);

		write(textureFile, deflateSync(new Uint8Array(buffer), { level: 9 }));
	}

	console.log(
		`\t- Textures finished [hit ${Atomics.load(textureHits, 0)}/${chunks.length}] [${timer.format()}]`,
	);

	return transfer(textures, transfers);
};

export interface GameWorker {
	chunks: typeof chunks;
	cancelChunks: typeof cancelChunks;

	textures: typeof textures;
	cancelTextures: typeof cancelTextures;
}

expose({
	chunks,
	cancelChunks,

	textures,
	cancelTextures,
});
