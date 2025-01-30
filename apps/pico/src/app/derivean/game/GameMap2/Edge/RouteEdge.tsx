import {
    getStraightPath,
    useInternalNode,
    type Edge,
    type EdgeProps,
} from "@xyflow/react";
import type { FC } from "react";
import { getEdgeParams } from "~/app/derivean/utils/getEdgeParams";

export namespace RouteEdge {
	export interface Data {
		id: string;
		fromId: string;
		toId: string;
		[key: string]: unknown;
	}

	export type RouteEdge = Edge<Data, "route">;

	export interface Props extends EdgeProps<RouteEdge> {
		//
	}
}

export const RouteEdge: FC<RouteEdge.Props> = ({
	id,
	source,
	target,
	markerEnd,
	markerStart,
	style,
}) => {
	const sourceNode = useInternalNode(source);
	const targetNode = useInternalNode(target);

	if (!sourceNode || !targetNode) {
		return null;
	}

	const { sx, sy, tx, ty } = getEdgeParams(sourceNode, targetNode);

	const [edgePath] = getStraightPath({
		sourceX: sx,
		sourceY: sy,
		targetX: tx,
		targetY: ty,
	});

	return (
		<path
			id={id}
			className={"react-flow__edge-path"}
			d={edgePath}
			markerStart={markerStart}
			markerEnd={markerEnd}
			style={style}
		/>
	);
};
