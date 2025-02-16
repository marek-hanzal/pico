import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { withList } from "@use-pico/client";
import {
    Kysely,
    withBoolSchema,
    withJsonOutputSchema
} from "@use-pico/common";
import { z } from "zod";
import { BuildingPanel } from "~/app/derivean/game/GameMap2/Building/BuildingPanel";
import { RequirementPanel } from "~/app/derivean/game/GameMap2/Construction/Requirement/RequirementPanel";

export const Route = createFileRoute(
	"/$locale/apps/derivean/map/$mapId/building/$buildingId/view",
)({
	async loader({
		context: { queryClient, kysely, session },
		params: { mapId, buildingId },
	}) {
		const user = await session();

		return {
			user,
			requirement: await queryClient.ensureQueryData({
				queryKey: [
					"GameMap",
					mapId,
					"building",
					buildingId,
					"construction",
					"requirement",
				],
				async queryFn() {
					return kysely.transaction().execute(async (tx) => {
						return withList({
							select: tx
								.selectFrom("Blueprint_Requirement as br")
								.innerJoin("Building as bg", (eb) => {
									return eb
										.onRef("bg.blueprintId", "=", "br.blueprintId")
										.on("bg.id", "=", buildingId);
								})
								.innerJoin("Resource as r", "r.id", "br.resourceId")
								.select([
									"br.id",
									"r.name",
									"br.amount",
									"br.passive",
									(eb) => {
										return eb
											.selectFrom("Transport as t")
											.select((eb) =>
												eb.fn.count<number>("t.id").as("transport"),
											)
											.whereRef("t.targetId", "=", "bg.id")
											.whereRef("t.resourceId", "=", "br.resourceId")
											.as("transport");
									},
									(eb) => {
										return eb
											.selectFrom("Supply as s")
											.innerJoin("Building as b", "b.id", "s.buildingId")
											.innerJoin("Blueprint as bp", "bp.id", "b.blueprintId")
											.select((eb) => {
												return Kysely.jsonObject({
													id: eb.ref("s.id"),
													buildingId: eb.ref("s.buildingId"),
													name: eb.ref("bp.name"),
												}).as("supply");
											})
											.whereRef("s.resourceId", "=", "br.resourceId")
											.where(
												"s.buildingId",
												"in",
												eb
													.selectFrom("Building_To_Building as btb")
													.select("btb.linkId")
													.where("btb.buildingId", "=", buildingId),
											)
											.as("supply");
									},
									(eb) => {
										return eb
											.selectFrom("Inventory as i")
											.select(["i.amount"])
											.where(
												"i.id",
												"in",
												tx
													.selectFrom("Building_Inventory as bi")
													.select("bi.inventoryId")
													.where("bi.buildingId", "=", buildingId),
											)
											.whereRef("i.resourceId", "=", "br.resourceId")
											.where("i.type", "=", "construction")
											.limit(1)
											.as("available");
									},
									(eb) => {
										return eb
											.selectFrom("Demand as d")
											.select((eb) => {
												return Kysely.jsonObject({
													id: eb.ref("d.id"),
													priority: eb.ref("d.priority"),
												}).as("demand");
											})
											.whereRef("d.resourceId", "=", "br.resourceId")
											.where("d.buildingId", "=", buildingId)
											.as("demand");
									},
								])
								.orderBy("r.name", "asc"),
							output: z.object({
								id: z.string().min(1),
								name: z.string().min(1),
								amount: z.number().nonnegative(),
								transport: z.number().nonnegative(),
								available: z.number().nonnegative().nullish(),
								supply: withJsonOutputSchema(
									z.object({
										id: z.string().min(1),
										buildingId: z.string().min(1),
										name: z.string().min(1),
									}),
								).nullish(),
								demand: withJsonOutputSchema(
									z.object({
										id: z.string().min(1),
										priority: z.number(),
									}),
								).nullish(),
								passive: withBoolSchema(),
							}),
						});
					});
				},
			}),
		};
	},
	component() {
		const { building } = useLoaderData({
			from: "/$locale/apps/derivean/map/$mapId/building/$buildingId",
		});
		const { user, requirement } = Route.useLoaderData();

		return building.constructionId ?
				<RequirementPanel
					userId={user.id}
					building={building}
					requirement={requirement}
				/>
			:	<BuildingPanel building={building} />;
	},
});
