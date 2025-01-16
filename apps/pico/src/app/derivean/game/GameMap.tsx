import {
    Background,
    BackgroundVariant,
    Controls,
    MiniMap,
    ReactFlow,
} from "@xyflow/react";
import { useMemo, type FC } from "react";
import { BlueprintAvailableNode } from "~/app/derivean/game/GameMap/BlueprintAvailableNode";
import { BlueprintMissingBuildingsNode } from "~/app/derivean/game/GameMap/BlueprintMissingBuildingsNode";
import { BlueprintMissingResourcesNode } from "~/app/derivean/game/GameMap/BlueprintMissingResourcesNode";
import { BuildingNode } from "~/app/derivean/game/GameMap/BuildingNode";
import { ConstructionNode } from "~/app/derivean/game/GameMap/ConstructionNode";
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
		showResourcesOf?: string;
		inventory: InventorySchema["~entity-array"];
		zoomTo?: string;
	}
}

export const GameMap: FC<GameMap.Props> = ({
	userId,
	showResourcesOf,
	inventory,
	graph,
	zoomTo,
}) => {
	return (
		<div
			className={
				"w-fit h-fit mx-auto border border-slate-300 rounded-md shadow-md m-8"
			}
		>
			<div style={{ width: "95vw", height: "85vh" }}>
				<ReactFlow
					nodes={graph.nodes}
					edges={graph.edges}
					fitView
					snapGrid={[16, 16]}
					elementsSelectable={false}
					nodeTypes={useMemo(
						() => ({
							"building"(props) {
								return (
									<BuildingNode
										showId={showResourcesOf}
										userId={userId}
										inventory={inventory}
										{...props}
									/>
								);
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
						}),
						[userId, inventory, showResourcesOf],
					)}
				>
					<ZoomToNode nodeId={zoomTo} />
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
				</ReactFlow>
			</div>
		</div>
	);
};
