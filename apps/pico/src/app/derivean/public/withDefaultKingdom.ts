import type { Transaction } from "kysely";
import type { Database } from "~/app/derivean/db/Database";
import { InventorySource } from "~/app/derivean/inventory/InventorySource";
import { ResourceSource } from "~/app/derivean/resource/ResourceSource";

export namespace withDefaultKingdom {
	export interface Props {
		tx: Transaction<Database>;
		userId: string;
	}
}

export const withDefaultKingdom = async ({
	tx,
	userId,
}: withDefaultKingdom.Props) => {
	const resources = [
		{
			resource: "Wood",
			amount: 25,
		},
		{
			resource: "Stone",
			amount: 10,
		},
		{
			resource: "Storage - Blueprint",
			amount: 1,
		},
		{
			resource: "House - Blueprint",
			amount: 10,
		},
		{
			resource: "Castle - Blueprint",
			amount: 1,
		},
	] as const;

	for await (const resource of resources) {
		const shape = {
			userId,
			resourceId: (
				await ResourceSource.fetchOrThrow$({
					tx,
					where: { name: resource.resource },
					error: `Cannot find resource [${resource}]`,
				})
			).id,
			amount: resource.amount,
		} as const;

		await InventorySource.create$({
			tx,
			shape,
			entity: shape,
		});
	}
};
