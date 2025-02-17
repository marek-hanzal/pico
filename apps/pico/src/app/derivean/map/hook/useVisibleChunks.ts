import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { OrthographicCamera } from "three";

export namespace useVisibleChunks {
	export interface Props {
		chunkSize: number;
		offset?: number;
	}

	export interface View {
		hash: string;
		minX: number;
		maxX: number;
		minZ: number;
		maxZ: number;
		count: number;
	}
}

export const useVisibleChunks = ({
	chunkSize,
	offset = 0,
}: useVisibleChunks.Props) => {
	const { camera, size } = useThree(({ camera, size }) => ({
		camera: camera as OrthographicCamera,
		size,
	}));

	useEffect(() => {
		if (!(camera instanceof OrthographicCamera)) {
			console.error("This computation is designed for an orthographic camera.");
		}
	}, [camera]);

	return useMemo(() => {
		return (): useVisibleChunks.View => {
			const viewHeight = (camera.top - camera.bottom) / camera.zoom;
			const viewWidth = (camera.right - camera.left) / camera.zoom;

			const halfW = viewWidth * 0.5;
			const halfH = viewHeight * 0.5;
			const size = chunkSize / 2;

			const minX =
				Math.floor((camera.position.x - halfW + size) / chunkSize) - offset;
			const maxX =
				Math.ceil((camera.position.x + halfW + size) / chunkSize) + offset;
			const minZ =
				Math.floor((camera.position.z - halfH + size) / chunkSize) - offset;
			const maxZ =
				Math.ceil((camera.position.z + halfH + size) / chunkSize) + offset;

			return {
				hash: `[${minX} → ${maxX}]:[${minZ} → ${maxZ}]`,
				count: (maxX - minX) * (maxZ - minZ),
				minX,
				maxX,
				minZ,
				maxZ,
			};
		};
	}, [camera, size, chunkSize, offset]);
};
