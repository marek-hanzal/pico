import { ReactFlowProvider } from "@xyflow/react";
import { type FC } from "react";
import { Content } from "~/app/derivean/game/GameMap2/Content";
import type { BuildingSchema } from "~/app/derivean/game/GameMap2/schema/BuildingSchema";
import type { ConstructionSchema } from "~/app/derivean/game/GameMap2/schema/ConstructionSchema";
import type { QueueSchema } from "~/app/derivean/game/GameMap2/schema/QueueSchema";

export namespace GameMap2 {
	export interface Props {
		userId: string;
		cycle: number;
		construction: ConstructionSchema.Type[];
		queue: QueueSchema.Type[];
		building: BuildingSchema.Type[];
		zoomToId?: string;
	}
}

export const GameMap2: FC<GameMap2.Props> = ({
	cycle,
	userId,
	construction,
	building,
	queue,
	zoomToId,
}) => {
	return (
		<ReactFlowProvider>
			<Content
				userId={userId}
				cycle={cycle}
				construction={construction}
				queue={queue}
				building={building}
				zoomToId={zoomToId}
			/>
		</ReactFlowProvider>
	);
};
