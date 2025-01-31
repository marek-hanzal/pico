import { genId } from "@use-pico/common";
import type { WithTransaction } from "~/app/derivean/db/WithTransaction";

export namespace withProductionQueue {
	export interface Props {
		tx: WithTransaction;
		userId: string;
		mapId: string;
		buildingId: string;
		blueprintProductionId: string;
	}
}

export const withProductionQueue = async ({
	tx,
	userId,
	mapId,
	buildingId,
	blueprintProductionId,
}: withProductionQueue.Props) => {
	const blueprintProduction = await tx
		.selectFrom("Blueprint_Production as bp")
		.innerJoin("Blueprint as b", "b.id", "bp.blueprintId")
		.innerJoin("Resource as r", "r.id", "bp.resourceId")
		.select([
			"bp.cycles",
			"r.name as resource",
			"bp.amount",
			"bp.cycles",
			"b.name as blueprint",
		])
		.where("bp.id", "=", blueprintProductionId)
		.executeTakeFirstOrThrow();

	console.info("\t=== Production Queue", {
		building: blueprintProduction.blueprint,
		resource: blueprintProduction.resource,
		amount: blueprintProduction.amount,
		cycles: blueprintProduction.cycles,
	});

	const requirements = await tx
		.selectFrom("Blueprint_Production_Requirement as bpr")
		.innerJoin("Resource as r", "r.id", "bpr.resourceId")
		.select(["bpr.resourceId", "bpr.amount", "bpr.passive"])
		.where("bpr.blueprintProductionId", "=", blueprintProductionId)
		.execute();

	if (!requirements.length) {
		console.info("\t\t-- No production requirements");
	}

	let proceed = true;
	const update = new Map<string, number>();

	for await (const { resourceId, amount, passive } of requirements) {
		const inventory = await tx
			.selectFrom("Inventory as i")
			.innerJoin("Building_Inventory as bi", "bi.inventoryId", "i.id")
			.innerJoin("Resource as r", "r.id", "i.resourceId")
			.select(["i.id", "i.amount", "r.name"])
			.where("bi.buildingId", "=", buildingId)
			.where("i.resourceId", "=", resourceId)
			.where("i.type", "=", "storage")
			.executeTakeFirstOrThrow();

		console.info("\t\t-- Checking inventory", {
			resource: inventory.name,
			amount: inventory.amount,
		});

		if (inventory.amount < amount) {
			console.info(
				"\t\t\t-- Not enough resources in inventory, creating demand",
				{
					amount: amount - inventory.amount,
				},
			);

			proceed = false;

			const transport = await tx
				.selectFrom("Transport as t")
				.select(["t.amount"])
				.where("t.resourceId", "=", resourceId)
				.where("t.targetId", "=", buildingId)
				.where("t.amount", ">=", amount - inventory.amount)
				.executeTakeFirst();

			if (transport) {
				console.info(
					"\t\t\t-- Transport already on the way, waiting for it to arrive",
				);
				continue;
			}

			await tx
				.insertInto("Demand")
				.values({
					id: genId(),
					amount: amount - inventory.amount,
					userId,
					mapId,
					buildingId,
					priority: 10,
					resourceId,
					type: "storage",
				})
				.onConflict((oc) => {
					return oc.columns(["buildingId", "resourceId"]).doUpdateSet({
						amount: amount - inventory.amount,
					});
				})
				.execute();

			continue;
		}

		if (!passive) {
			update.set(inventory.id, inventory.amount - amount);
		}
	}

	if (proceed) {
		console.info("\t\t-- Adding production to queue");

		for await (const [id, amount] of update) {
			await tx
				.updateTable("Inventory")
				.set("amount", amount)
				.where("id", "=", id)
				.execute();
		}

		await tx
			.insertInto("Production")
			.values({
				id: genId(),
				buildingId,
				blueprintProductionId,
				userId,
				cycle: 0,
				cycles: blueprintProduction.cycles,
			})
			.execute();
	} else {
		console.info("\t\t-- Not enough resources to proceed");
	}

	console.info("\t-- Done");

	return proceed;
};
