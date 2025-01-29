import { DateTime, genId } from "@use-pico/common";
import type { Transaction } from "kysely";
import type { Database } from "~/app/derivean/db/sdk";
import { withBuildingRouteBuilding } from "~/app/derivean/service/withBuildingRouteBuilding";
import { withConstruction } from "~/app/derivean/service/withCycle/withConstruction";
import { withDemand } from "~/app/derivean/service/withCycle/withDemand";
import { withProduction } from "~/app/derivean/service/withCycle/withProduction";
import { withProductionPlan } from "~/app/derivean/service/withCycle/withProductionPlan";
import { withTransport } from "~/app/derivean/service/withCycle/withTransport";

export namespace withCycle {
	export interface Props {
		tx: Transaction<Database>;
		userId: string;
		mapId: string;
	}
}

export const withCycle = async ({ tx, userId, mapId }: withCycle.Props) => {
	try {
		await tx
			.insertInto("Cycle")
			.values({
				id: genId(),
				stamp: DateTime.now().toUTC().toSQLTime(),
				userId,
				mapId,
			})
			.execute();

		/**
		 * Ensure all paths are computed even it should be OK in this stage.
		 */
		await withBuildingRouteBuilding({
			tx,
			userId,
			mapId,
		});

		/**
		 * Resolve demand of buildings:
		 * - check construction
		 * - check production
		 */
		await withDemand({
			tx,
			userId,
			mapId,
		});

		await withConstruction({
			tx,
			userId,
			mapId,
		});

		/**
		 * Produce stuff
		 */
		await withProduction({
			tx,
			userId,
			mapId,
		});

		await withProductionPlan({
			tx,
			userId,
			mapId,
		});

		/**
		 * Resolve transportation:
		 * - looks into demands
		 * - if there is enough resources, create transport path
		 */
		await withTransport({
			tx,
			userId,
			mapId,
		});
	} catch (e) {
		console.error(e);
		throw e;
	}
};
