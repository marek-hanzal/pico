import { createFileRoute } from "@tanstack/react-router";
import { withList } from "@use-pico/client";
import { z } from "zod";
import { LandPanel } from "~/app/derivean/game/GameMap2/Land/LandPanel";

export const Route = createFileRoute(
	"/$locale/apps/derivean/map/$id/land/list",
)({
	async loader({ context: { queryClient, kysely }, params: { id } }) {
		return {
			land: await queryClient.ensureQueryData({
				queryKey: ["GameMap", id, "land"],
				async queryFn() {
					return kysely.transaction().execute(async (tx) => {
						return withList({
							select: tx
								.selectFrom("Land as l")
								.innerJoin("Region as r", "r.id", "l.regionId")
								.select([
									"l.id",
									"r.name",
									"l.mapId",
									"l.x",
									"l.y",
									"l.width",
									"l.height",
								])
								.where("l.mapId", "=", id)
								.orderBy("r.name"),
							output: z.object({
								id: z.string().min(1),
								name: z.string().min(1),
								mapId: z.string().min(1),
								x: z.number(),
								y: z.number(),
								width: z.number(),
								height: z.number(),
							}),
						});
					});
				},
			}),
		};
	},
	component() {
		const { id } = Route.useParams();
		const { land } = Route.useLoaderData();

		return (
			<LandPanel
				mapId={id}
				land={land}
			/>
		);
	},
});
