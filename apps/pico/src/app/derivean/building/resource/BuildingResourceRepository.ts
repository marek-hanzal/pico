import { withRepository } from "@use-pico/client";
import { BuildingRepository } from "~/app/derivean/building/BuildingRepository";
import { BuildingResourceSchema } from "~/app/derivean/building/resource/BuildingResourceSchema";
import { db } from "~/app/derivean/db/db";
import { ResourceRepository } from "~/app/derivean/resource/ResourceRepository";

export const BuildingResourceRepository = withRepository({
	name: "BuildingResourceRepository",
	schema: BuildingResourceSchema,
	meta: {
		where: {
			id: "br.id",
			idIn: "br.id",
			buildingId: "br.buildingId",
			resourceId: "br.resourceId",
			userId: "b.userId",
		},
		fulltext: ["br.id", "bb.name", "r.name"],
	},
	insert() {
		return db.kysely.insertInto("Building_Resource");
	},
	update() {
		return db.kysely.updateTable("Building_Resource");
	},
	remove() {
		return db.kysely.deleteFrom("Building_Resource");
	},
	select() {
		return db.kysely
			.selectFrom("Building_Resource as br")
			.selectAll("br")
			.leftJoin("Building as b", "b.id", "br.buildingId")
			.leftJoin("BaseBuilding as bb", "bb.id", "b.baseBuildingId")
			.leftJoin("Resource as r", "r.id", "br.resourceId");
	},
	async toOutput({ entity }) {
		return {
			...entity,
			building: await BuildingRepository.fetchOrThrow({
				query: { where: { id: entity.buildingId } },
			}),
			resource: await ResourceRepository.fetchOrThrow({
				query: { where: { id: entity.resourceId } },
			}),
		};
	},
});
