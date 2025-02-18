import { Timer } from "@use-pico/common";
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

	console.log(`Generating ${count} chunks, ${hash}`);

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

	const chunks = new Array<Chunks.Chunk>(count);

	let hit = 0;

	try {
		let index = 0;
		for (let x = minX; x < maxX; x++) {
			for (let z = minZ; z < maxZ; z++) {
				const chunkId = `${x}:${z}`;
				const chunkFile = `/chunk/${id}/${chunkId}.borsh`;

				if (await file(chunkFile).exists()) {
					chunks[index++] = deserialize(
						ChunkBorshSchema,
						decompressSync(new Uint8Array(await file(chunkFile).arrayBuffer())),
					) as Chunks.Chunk;

					hit++;
					continue;
				}

				const data = {
					id: chunkId,
					x,
					z,
					tiles: generator({ x, z }),
				} as const;

				chunks[index++] = data;

				try {
					await write(
						chunkFile,
						deflateSync(serialize(ChunkBorshSchema, data), { level: 9 }),
					);
				} catch (e) {
					console.error(e);
				}
			}
		}
	} catch (e) {
		console.error(e);
		throw e;
	}

	console.log(`\t- Chunks finished [hit ${hit}/${count}] [${timer.format()}]`);

	return chunks;
};

export const textures = async (
	id: string,
	chunks: Chunks.Chunk[],
	chunkSize: number,
	hash: string,
) => {
	const timer = new Timer();
	timer.start();

	console.log(`Generating ${chunks.length} textures, ${hash}`);

	await dir(`/texture/${id}`).create();

	const textures: Record<string, Texture> = {};

	const canvas = new OffscreenCanvas(chunkSize, chunkSize);
	const ctx = canvas.getContext("2d", { willReadFrequently: true });

	if (!ctx) {
		console.error("Cannot use OffscreenCanvas");
		return textures;
	}

	const transfers: ArrayBufferLike[] = [];

	let hit = 0;

	for (const chunk of chunks) {
		const textureFile = `/texture/${id}/${chunk.id}.bin`;

		if (await file(textureFile).exists()) {
			const data = new Uint8ClampedArray(
				decompressSync(new Uint8Array(await file(textureFile).arrayBuffer())),
			);
			const image = new ImageData(data, chunkSize, chunkSize);

			textures[chunk.id] = {
				width: image.width,
				height: image.height,
				data: image.data.buffer,
			};
			transfers.push(image.data.buffer);

			hit++;
			continue;
		}

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		chunk.tiles.forEach((tile) => {
			ctx.fillStyle = withColorMap({
				value: tile.noise,
				levels: Game.colorMap,
			});
			ctx.fillRect(tile.pos.x, tile.pos.z, Game.plotSize, Game.plotSize);
		});

		const image = ctx.getImageData(0, 0, canvas.width, canvas.height);

		textures[chunk.id] = {
			width: canvas.width,
			height: canvas.height,
			data: image.data.buffer,
		};
		transfers.push(image.data.buffer);

		await write(
			textureFile,
			deflateSync(new Uint8Array(image.data), { level: 9 }),
		);
	}

	console.log(
		`\t- Textures finished [hit ${hit}/${chunks.length}] [${timer.format()}]`,
	);

	return transfer(textures, transfers);
};

export interface GameWorker {
	chunks: typeof chunks;
	textures: typeof textures;
}

const api = {
	chunks,
	textures,
};

expose(api);
