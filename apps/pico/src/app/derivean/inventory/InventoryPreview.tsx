import { useParams } from "@tanstack/react-router";
import { LinkTo, ListIcon, Preview, TitlePreview, Tx } from "@use-pico/client";
import type { FC } from "react";
import { InventoryIcon } from "~/app/derivean/icon/InventoryIcon";
import type { InventorySchema } from "~/app/derivean/inventory/schema/InventorySchema";

export namespace InventoryPreview {
	export interface Props extends Preview.PropsEx<InventorySchema.Type> {
		//
	}
}

export const InventoryPreview: FC<InventoryPreview.Props> = (props) => {
	const { locale } = useParams({ from: "/$locale" });

	return (
		<Preview
			title={({ entity }) => (
				<TitlePreview
					icon={InventoryIcon}
					title={entity.name}
				/>
			)}
			actions={() => (
				<>
					<LinkTo
						icon={ListIcon}
						to={"/$locale/apps/derivean/root/inventory/list"}
						params={{ locale }}
					>
						<Tx label={"Inventory list (label)"} />
					</LinkTo>
				</>
			)}
			{...props}
		/>
	);
};
