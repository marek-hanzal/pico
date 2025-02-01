import { useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
    Action,
    CloseIcon,
    Icon,
    LoaderIcon,
    Modal,
    Tx,
    useInvalidator,
} from "@use-pico/client";
import { genId, tvc, withBase64 } from "@use-pico/common";
import {
    Background,
    BackgroundVariant,
    BaseEdge,
    Controls,
    EdgeLabelRenderer,
    getBezierPath,
    MiniMap,
    ReactFlow,
    useReactFlow,
} from "@xyflow/react";
import { useMemo, type FC } from "react";
import { kysely } from "~/app/derivean/db/kysely";
import { BlueprintIcon } from "~/app/derivean/icon/BlueprintIcon";
import { BlueprintForm } from "~/app/derivean/root/BlueprintForm";
import { BlueprintNode } from "~/app/derivean/root/Editor/BlueprintNode";
import { ZoomToNode } from "~/app/derivean/ui/ZoomToNode";

export namespace Editor {
	export interface Data {
		nodes: any[];
		edges: any[];
	}

	export interface Props {
		data: Data;
		zoomTo?: string;
	}
}

export const Editor: FC<Editor.Props> = ({ data, zoomTo }) => {
	const invalidator = useInvalidator([]);

	const dependencyMutation = useMutation({
		async mutationFn({
			blueprintId,
			dependencyId,
		}: {
			blueprintId: string;
			dependencyId: string;
		}) {
			return kysely.transaction().execute(async (tx) => {
				return tx
					.insertInto("Blueprint_Dependency")
					.values({
						id: genId(),
						blueprintId,
						dependencyId,
					})
					.execute();
			});
		},
		async onSuccess() {
			await invalidator();
		},
	});

	return (
		<div
			className={
				"w-fit h-fit mx-auto border border-slate-300 rounded-md shadow-md m-8"
			}
		>
			<div style={{ width: "95vw", height: "85vh" }}>
				<ReactFlow
					nodes={data.nodes}
					edges={data.edges}
					onConnect={(params) => {
						dependencyMutation.mutate({
							blueprintId: params.target,
							dependencyId: params.source,
						});
					}}
					fitView
					snapGrid={[16, 16]}
					elementsSelectable={false}
					nodeTypes={useMemo(
						() => ({
							blueprint(props) {
								return <BlueprintNode {...props} />;
							},
						}),
						[],
					)}
					edgeTypes={useMemo(
						() => ({
							dependency({
								id,
								sourceX,
								sourceY,
								targetX,
								targetY,
								sourcePosition,
								targetPosition,
								style = {},
								markerEnd,
							}) {
								const { setEdges } = useReactFlow();
								const [edgePath, labelX, labelY] = getBezierPath({
									sourceX,
									sourceY,
									sourcePosition,
									targetX,
									targetY,
									targetPosition,
								});

								const invalidator = useInvalidator([]);

								const mutation = useMutation({
									async mutationFn({ id }: { id: string }) {
										return kysely.transaction().execute(async (tx) => {
											await tx
												.deleteFrom("Blueprint_Dependency")
												.where("id", "=", id)
												.execute();
										});
									},
									async onSuccess() {
										setEdges((edges) => edges.filter((edge) => edge.id !== id));
										await invalidator();
									},
								});

								return (
									<>
										<BaseEdge
											path={edgePath}
											markerEnd={markerEnd}
											style={style}
										/>
										<EdgeLabelRenderer>
											<div
												className={tvc("nodrag nopan", [
													"flex",
													"items-center",
													"justify-center",
													"cursor-pointer",
													"bg-red-200",
													"text-red-500",
													"border",
													"border-red-300",
													"hover:border-red-600",
													"hover:bg-red-300",
													"hover:text-red-700",
													"rounded-full",
													"w-4",
													"h-4",
													"z-20",
												])}
												style={{
													position: "absolute",
													pointerEvents: "all",
													transformOrigin: "center",
													transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
												}}
											>
												<Icon
													icon={mutation.isPending ? LoaderIcon : CloseIcon}
													onClick={() => {
														mutation.mutate({ id });
													}}
												/>
											</div>
										</EdgeLabelRenderer>
									</>
								);
							},
						}),
						[],
					)}
				>
					<ZoomToNode nodeId={zoomTo} />
					<Controls
						orientation={"horizontal"}
						showInteractive={false}
						showZoom={false}
					>
						<Modal
							target={
								<Action
									className={"react-flow__controls-button"}
									iconEnabled={BlueprintIcon}
								/>
							}
							outside={false}
							textTitle={<Tx label={"Create blueprint (modal)"} />}
							css={{
								modal: ["w-1/3"],
							}}
						>
							{({ close }) => {
								const invalidator = useInvalidator([["Editor"]]);
								const { locale } = useParams({ from: "/$locale" });
								const navigate = useNavigate();

								return (
									<BlueprintForm
										mutation={useMutation({
											async mutationFn({ image, regionIds, ...values }) {
												return kysely.transaction().execute(async (tx) => {
													const blueprint = await tx
														.insertInto("Blueprint")
														.values({
															id: genId(),
															...values,
															image: image ? await withBase64(image) : null,
														})
														.returningAll()
														.executeTakeFirstOrThrow();

													if (regionIds?.length) {
														await tx
															.insertInto("Blueprint_Region")
															.values(
																regionIds.map((regionId) => ({
																	id: genId(),
																	blueprintId: blueprint.id,
																	regionId,
																})),
															)
															.execute();
													}

													return blueprint;
												});
											},
											async onSuccess(data) {
												await invalidator();
												navigate({
													to: "/$locale/apps/derivean/root/editor",
													params: { locale },
													search: {
														zoomTo: data.id,
													},
												});
												close();
											},
										})}
									/>
								);
							}}
						</Modal>
					</Controls>
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
