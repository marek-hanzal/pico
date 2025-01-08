import {
    createFileRoute,
    Outlet,
    useRouteContext,
} from "@tanstack/react-router";
import { withFetch } from "@use-pico/client";
import { z } from "zod";
import { BuildingIndexMenu } from "~/app/derivean/root/building/BuildingIndexMenu";
import { BuildingPreview } from "~/app/derivean/root/building/BuildingPreview";

export const Route = createFileRoute(
	"/$locale/apps/derivean/root/building/$id",
)({
	async loader({ context: { kysely }, params: { id } }) {
		return kysely.transaction().execute(async (tx) => {
			return {
				entity: await withFetch({
					select: tx
						.selectFrom("Building as b")
						.innerJoin("Building_Base as bb", "bb.id", "b.buildingBaseId")
						.innerJoin("Resource as r", "r.id", "bb.resourceId")
						.selectAll("b")
						.select("r.name")
						.where("b.id", "=", id),
					output: z.object({
						id: z.string().min(1),
						name: z.string().min(1),
					}),
				}),
			};
		});
	},
	component() {
		const { tva } = useRouteContext({ from: "__root__" });
		const { entity } = Route.useLoaderData();
		const tv = tva().slots;

		return (
			<div className={tv.base()}>
				<BuildingPreview entity={entity} />

				<BuildingIndexMenu entity={entity} />

				<Outlet />
			</div>
		);
	},
});
