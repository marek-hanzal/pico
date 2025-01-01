import { withRepository } from "@use-pico/client";
import { db } from "~/app/derivean/db/db";
import { ResourceSchema } from "~/app/derivean/resource/ResourceSchema";

export const ResourceRepository = withRepository({
	name: "Resource",
	schema: ResourceSchema,
	meta: {
		where: {
			id: "resource.id",
			idIn: "resource.id",
		},
		fulltext: ["resource.description", "resource.name", "resource.id"],
	},
	insert() {
		return db.kysely.insertInto("Resource");
	},
	update() {
		return db.kysely.updateTable("Resource");
	},
	remove() {
		return db.kysely.deleteFrom("Resource");
	},
	select() {
		return db.kysely.selectFrom("Resource as resource").selectAll("resource");
	},
	async toCreate({ entity }) {
		return entity;
	},
});
