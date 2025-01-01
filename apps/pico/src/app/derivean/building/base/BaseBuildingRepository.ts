import { withRepository } from "@use-pico/client";
import { BaseBuildingSchema } from "~/app/derivean/building/base/BaseBuildingSchema";
import { BuildingRequirementResourceRepository } from "~/app/derivean/building/requirement/resource/BuildingRequirementResourceRepository";
import { db } from "~/app/derivean/db/db";

export const BaseBuildingRepository = withRepository({
	name: "BaseBuilding",
	schema: BaseBuildingSchema,
	meta: {
		where: {
			id: "baseBuilding.id",
			idIn: "baseBuilding.id",
		},
		fulltext: [
			"baseBuilding.name",
			"baseBuilding.description",
			"baseBuilding.id",
		],
	},
	insert() {
		return db.kysely.insertInto("BaseBuilding");
	},
	update() {
		return db.kysely.updateTable("BaseBuilding");
	},
	remove() {
		return db.kysely.deleteFrom("BaseBuilding");
	},
	select() {
		return db.kysely
			.selectFrom("BaseBuilding as baseBuilding")
			.selectAll("baseBuilding");
	},
	async toOutput({ entity }) {
		return {
			...entity,
			requiredResources: await BuildingRequirementResourceRepository.list({
				query: {
					where: {
						baseBuildingId: entity.id,
					},
				},
			}),
		};
	},
});
