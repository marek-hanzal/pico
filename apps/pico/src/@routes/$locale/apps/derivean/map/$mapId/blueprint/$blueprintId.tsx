import { createFileRoute } from "@tanstack/react-router";
import { withFetch } from "@use-pico/client";
import { z } from "zod";

export const Route = createFileRoute(
	"/$locale/apps/derivean/map/$mapId/blueprint/$blueprintId",
)({
	async loader({ context: { queryClient, kysely }, params: { blueprintId } }) {
		return {
			blueprint: await queryClient.ensureQueryData({
				queryKey: ["GameMap", "blueprint", blueprintId, "fetch"],
				async queryFn() {
					return kysely.transaction().execute(async (tx) => {
						return withFetch({
							select: tx
								.selectFrom("Blueprint as b")
								.select(["b.id", "b.name"])
								.where("b.id", "=", blueprintId),
							output: z.object({
								id: z.string().min(1),
								name: z.string().min(1),
							}),
						});
					});
				},
			}),
		};
	},
});
