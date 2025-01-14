import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import {
    navigateOnCursor,
    navigateOnFilter,
    navigateOnFulltext,
    navigateOnSelection,
    Tx,
    withListCount,
    withSourceSearchSchema,
} from "@use-pico/client";
import { genId } from "@use-pico/common";
import { z } from "zod";
import { Inventory_Table } from "~/app/derivean/root/inventory/Inventory_Table";
import { Inventory_Schema } from "~/app/derivean/schema/inventory/Inventory_Schema";

export const Route = createFileRoute(
	"/$locale/apps/derivean/root/user/$id/inventory",
)({
	validateSearch: zodValidator(withSourceSearchSchema(Inventory_Schema)),
	loaderDeps({ search: { filter, cursor, sort } }) {
		return {
			filter,
			cursor,
			sort,
		};
	},
	async loader({
		context: { queryClient, kysely },
		deps: { filter, cursor },
		params: { id },
	}) {
		return queryClient.ensureQueryData({
			queryKey: ["Inventory", "list-count", id, { filter, cursor }],
			async queryFn() {
				return kysely.transaction().execute((tx) => {
					return withListCount({
						select: tx
							.selectFrom("Inventory as i")
							.innerJoin("Resource as r", "r.id", "i.resourceId")
							.select(["i.id", "i.resourceId", "r.name", "i.amount", "i.limit"])
							.where(
								"i.id",
								"in",
								tx
									.selectFrom("User_Inventory as ui")
									.where("ui.userId", "=", id)
									.select("ui.inventoryId"),
							)
							.orderBy("r.name", "asc"),
						query({ select, where }) {
							let $select = select;

							if (where?.id) {
								$select = $select.where("i.id", "=", where.id);
							}
							if (where?.idIn) {
								$select = $select.where("i.id", "in", where.idIn);
							}

							if (where?.fulltext) {
								const fulltext = `%${where.fulltext}%`.toLowerCase();

								$select = $select.where((qb) => {
									return qb.or([
										qb("i.id", "like", `%${fulltext}%`),
										qb("r.id", "like", `%${fulltext}%`),
										qb("r.name", "like", `%${fulltext}%`),
										qb(
											"r.id",
											"in",
											qb
												.selectFrom("Resource_Tag as rt")
												.innerJoin("Tag as t", "t.id", "rt.tagId")
												.select("rt.resourceId")
												.where((eb) => {
													return eb.or([
														eb("t.code", "like", fulltext),
														eb("t.label", "like", fulltext),
														eb("t.group", "like", fulltext),
													]);
												}),
										),
									]);
								});
							}

							return $select;
						},
						output: z.object({
							id: z.string().min(1),
							resourceId: z.string().min(1),
							name: z.string().min(1),
							amount: z.number().nonnegative(),
							limit: z.number().nonnegative(),
						}),
						filter,
						cursor,
					});
				});
			},
		});
	},
	component() {
		const { data, count } = Route.useLoaderData();
		const { filter, cursor, selection } = Route.useSearch();
		const navigate = Route.useNavigate();
		const { id } = Route.useParams();
		const { tva } = useRouteContext({ from: "__root__" });
		const tv = tva().slots;

		return (
			<div className={tv.base()}>
				<Inventory_Table
					onCreate={async ({ tx, entity }) => {
						return tx
							.insertInto("User_Inventory")
							.values({
								id: genId(),
								userId: id,
								inventoryId: entity.id,
							})
							.execute();
					}}
					table={{
						data,
						filter: {
							value: filter,
							set: navigateOnFilter(navigate),
						},
						selection: {
							type: "multi",
							value: selection,
							set: navigateOnSelection(navigate),
						},
					}}
					fulltext={{
						value: filter?.fulltext,
						set: navigateOnFulltext(navigate),
					}}
					cursor={{
						count,
						cursor,
						textTotal: <Tx label={"Number of items"} />,
						...navigateOnCursor(navigate),
					}}
				/>
			</div>
		);
	},
});
