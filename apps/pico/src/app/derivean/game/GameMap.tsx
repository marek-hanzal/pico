import {
    Background,
    BackgroundVariant,
    Controls,
    MiniMap,
    ReactFlow,
} from "@xyflow/react";
import { type FC } from "react";
import { BlueprintAvailableNode } from "~/app/derivean/game/GameMap/BlueprintAvailableNode";
import { BlueprintMissingBuildingsNode } from "~/app/derivean/game/GameMap/BlueprintMissingBuildingsNode";
import { BlueprintMissingResourcesNode } from "~/app/derivean/game/GameMap/BlueprintMissingResourcesNode";
import { BuildingDetail } from "~/app/derivean/game/GameMap/BuildingDetail";
import { BuildingNode } from "~/app/derivean/game/GameMap/BuildingNode";
import { ConstructionNode } from "~/app/derivean/game/GameMap/ConstructionNode";
import type { MapSchema } from "~/app/derivean/game/GameMap/MapSchema";
import type { InventorySchema } from "~/app/derivean/schema/InventorySchema";
import { ZoomToNode } from "~/app/derivean/ui/ZoomToNode";

export namespace GameMap {
	export interface Graph {
		nodes: any[];
		edges: any[];
	}

	export interface Props {
		graph: Graph;
		userId: string;
		blueprintId?: string;
		inventory: InventorySchema["~entity-array"];
	}
}

export const GameMap: FC<GameMap.Props> = ({
	userId,
	blueprintId,
	inventory,
	graph,
}) => {
	const detail: MapSchema.Type | undefined = graph.nodes.find(
		({ id }) => id === blueprintId,
	)?.data;

	return (
		<div className={"flex flex-row gap-2"}>
			<div className="flex-grow h-[calc(100vh-6rem)] border border-slate-300 rounded-md shadow-md">
				<ReactFlow
					className={"w-full h-full relative"}
					nodes={graph.nodes}
					edges={graph.edges}
					fitView
					snapGrid={[16, 16]}
					elementsSelectable={false}
					nodeTypes={{
						"building"(props) {
							return <BuildingNode {...props} />;
						},
						"construction"(props) {
							return <ConstructionNode {...props} />;
						},
						"blueprint-available"(props) {
							return (
								<BlueprintAvailableNode
									userId={userId}
									{...props}
								/>
							);
						},
						"blueprint-missing-resources"(props) {
							return <BlueprintMissingResourcesNode {...props} />;
						},
						"blueprint-missing-buildings"(props) {
							return <BlueprintMissingBuildingsNode {...props} />;
						},
						"blueprint-unavailable"(props) {
							return <BlueprintMissingBuildingsNode {...props} />;
						},
					}}
				>
					<ZoomToNode nodeId={detail?.id} />
					<Controls
						orientation={"horizontal"}
						showInteractive={false}
						showZoom={true}
					/>
					<MiniMap />
					<Background
						variant={BackgroundVariant.Dots}
						gap={12}
						size={1}
					/>

					{detail ?
						<div
							className={
								"react-flow__panel w-4/10 h-100 border bg-white border-slate-300 rounded-md shadow-md p-4 absolute top-4 right-4"
							}
						>
							<BuildingDetail
								detail={detail}
								userId={userId}
								inventory={inventory}
							/>
						</div>
					:	null}
				</ReactFlow>
			</div>
		</div>
	);
};
