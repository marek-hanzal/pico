import { createFileRoute } from "@tanstack/react-router";
import { withList } from "@use-pico/client";
import { z } from "zod";
import { LandPanel } from "~/app/derivean/game/GameMap2/Land/LandPanel";

export const Route = createFileRoute(
	"/$locale/apps/derivean/map/$mapId/land/list",
)({
	async loader({ context: { queryClient, kysely }, params: { mapId } }) {
		return {
			land: await queryClient.ensureQueryData({
				queryKey: ["GameMap", mapId, "land", "list"],
				async queryFn() {
					return kysely.transaction().execute(async (tx) => {
						return withList({
							select: tx
								.selectFrom("Land as l")
								.innerJoin("Region as r", "r.id", "l.regionId")
								.select(["l.id", "r.name", "l.mapId", "l.position"])
								.where("l.mapId", "=", mapId)
								.orderBy("r.name"),
							output: z.object({
								id: z.string().min(1),
								name: z.string().min(1),
								mapId: z.string().min(1),
								position: z.number(),
							}),
						});
					});
				},
			}),
		};
	},
	component() {
		const { land } = Route.useLoaderData();

		return <LandPanel land={land} />;
	},
});
