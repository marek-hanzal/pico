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
import { AmountInline } from "~/app/derivean/game/AmountInline";
import { ResourceIcon } from "~/app/derivean/icon/ResourceIcon";

export const Route = createFileRoute(
	"/$locale/apps/derivean/game/building/resource/list/",
)({
	validateSearch: zodValidator(withSourceSearchSchema(BuildingResourceSchema)),
	loaderDeps({ search: { filter, cursor } }) {
		return {
			filter,
			cursor,
		};
	},
	async loader({
		context: { queryClient, kysely, session },
		deps: { filter, cursor },
	}) {
		const user = await session();

		return kysely.transaction().execute(async (tx) => {
			return withListCountLoader({
				tx,
				queryClient,
				source: BuildingResourceSource,
				filter,
				cursor,
				where: {
					userId: user.id,
				},
			});
		});
	},
	component() {
		const { data, count } = Route.useLoaderData();
		const { filter, cursor, selection } = Route.useSearch();
		const navigate = Route.useNavigate();
		const { tva } = useRouteContext({ from: "__root__" });
		const tv = tva().slots;

		return (
			<div className={tv.base()}>
				<AmountInline
					icon={ResourceIcon}
					title={<Tx label={"Resource sum (label)"} />}
					amount={data}
				/>

				<BuildingResourceTable
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
