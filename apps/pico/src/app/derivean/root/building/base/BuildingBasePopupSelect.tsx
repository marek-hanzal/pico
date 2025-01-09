import { PopupSelect, Tx } from "@use-pico/client";
import type { IdentitySchema } from "@use-pico/common";
import type { FC } from "react";
import { withBuildingBaseListCount } from "~/app/derivean/building/base/withBuildingBaseListCount";
import { kysely } from "~/app/derivean/db/kysely";
import { BuildingBaseIcon } from "~/app/derivean/icon/BuildingBaseIcon";
import { BuildingBaseTable } from "~/app/derivean/root/building/base/BuildingBaseTable";

interface Data extends IdentitySchema.Type {
	name: string;
	cycles: number;
}

export namespace BuildingBasePopupSelect {
	export interface Props extends PopupSelect.PropsEx<Data> {
		//
	}
}

export const BuildingBasePopupSelect: FC<BuildingBasePopupSelect.Props> = (
	props,
) => {
	return (
		<PopupSelect<Data>
			icon={BuildingBaseIcon}
			textTitle={<Tx label={"Select building base (title)"} />}
			table={BuildingBaseTable}
			render={({ entity }) => {
				return entity.name;
			}}
			queryKey={"Building_Base"}
			query={async ({ filter, cursor }) => {
				return kysely.transaction().execute(async (tx) => {
					return withBuildingBaseListCount({
						tx,
						filter,
						cursor,
					});
				});
			}}
			{...props}
		/>
	);
};
