import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import {
    handleOnFulltext,
    handleOnPage,
    handleOnSize,
    Tx,
    withListCountLoader,
    withSourceSearchSchema,
} from "@use-pico/client";
import { BuildingResourceSchema } from "~/app/derivean/building/resource/BuildingResourceSchema";
import { BuildingResourceSource } from "~/app/derivean/building/resource/BuildingResourceSource";
import { BuildingResourceTable } from "~/app/derivean/building/resource/BuildingResourceTable";

export const Route = createFileRoute(
	"/$locale/apps/derivean/root/building/$id/resource/list/",
)({
	validateSearch: zodValidator(withSourceSearchSchema(BuildingResourceSchema)),
	loaderDeps({ search: { filter, cursor } }) {
		return {
			filter,
			cursor,
		};
	},
	async loader({
		context: { queryClient, kysely },
		deps: { filter, cursor },
		params: { id },
	}) {
		return kysely.transaction().execute((tx) => {
			return withListCountLoader({
				tx,
				queryClient,
				source: BuildingResourceSource,
				filter,
				cursor,
				where: {
					buildingId: id,
				},
			});
		});
	},
	component() {
		const { data, count } = Route.useLoaderData();
		const { filter, cursor, selection } = Route.useSearch();
		const { id } = Route.useParams();
		const navigate = Route.useNavigate();
		const { tva } = useRouteContext({ from: "__root__" });
		const tv = tva().slots;

		return (
			<div className={tv.base()}>
				<BuildingResourceTable
					buildingId={id}
					table={{
						data,
						filter: {
							value: filter,
							set(value) {
								navigate({
									search: ({ cursor, ...prev }) => ({
										...prev,
										filter: value,
										cursor: { ...cursor, page: 0 },
									}),
								});
							},
						},
						selection: {
							type: "multi",
							value: selection,
							set(selection) {
								navigate({
									search(prev) {
										return {
											...prev,
											selection,
										};
									},
								});
							},
						},
					}}
					fulltext={{
						onFulltext: handleOnFulltext(navigate),
						value: filter?.fulltext,
					}}
					cursor={{
						count,
						cursor,
						textTotal: <Tx label={"Number of items"} />,
						onPage: handleOnPage(navigate),
						onSize: handleOnSize(navigate),
					}}
				/>
			</div>
		);
	},
});
