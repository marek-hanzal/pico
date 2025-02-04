import { withDatabase } from "@use-pico/client";
import { sql } from "kysely";
import type { Database } from "~/app/derivean/db/sdk";

export const { kysely, bootstrap } = withDatabase<Database>({
	database: "derivean",
	async bootstrap({ kysely }) {
		const $id = "varchar(36)" as const;

		try {
			/**
			 * Just try of anything is available before all the table creations are run.
			 */
			await kysely
				.selectFrom("User")
				.select((eb) => eb.fn.countAll().as("count"))
				.executeTakeFirstOrThrow();
		} catch (_) {
			await kysely.schema
				.createTable("User")
				.ifNotExists()
				.addColumn("id", $id, (col) => col.primaryKey())

				.addColumn("name", "varchar(64)", (col) => col.notNull())
				.addColumn("login", "varchar(128)", (col) => col.notNull())
				.addColumn("password", "varchar(256)", (col) => col.notNull())

				.addUniqueConstraint("[User] login", ["login"])

				.execute();

			await kysely.schema
				.createTable("Tag")
				.ifNotExists()
				.addColumn("id", $id, (col) => col.primaryKey())

				.addColumn("code", "varchar(64)", (col) => col.notNull())
				.addColumn("label", "varchar(128)", (col) => col.notNull())
				.addColumn("group", "varchar(64)")
				.addColumn("sort", "integer", (col) => col.notNull().defaultTo(0))

				.addUniqueConstraint("Tag_code_group", ["code", "group"])

				.execute();

			await kysely.schema
				.createTable("Resource")
				.ifNotExists()
				.addColumn("id", $id, (col) => col.primaryKey())

				.addColumn("name", "varchar(64)", (col) => col.notNull())
				/**
				 * Weight of a resource used in transport.
				 */
				.addColumn("weight", "integer", (col) => col.notNull().defaultTo(1))

				/**
				 * Resource icon (base64 encoded).
				 */
				.addColumn("image", "text")

				.addUniqueConstraint("[Resource] name", ["name"])

				.execute();

			await kysely.schema
				.createTable("Resource_Tag")
				.ifNotExists()
				.addColumn("id", $id, (col) => col.primaryKey())

				.addColumn("resourceId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Resource_Tag] resourceId",
					["resourceId"],
					"Resource",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("tagId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Resource_Tag] tagId",
					["tagId"],
					"Tag",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addUniqueConstraint("[Resource_Tag] resourceId-tagId", [
					"resourceId",
					"tagId",
				])

				.execute();

			for await (const index of ["resourceId", "tagId"]) {
				await kysely.schema
					.createIndex(`[Resource_Tag] ${index}`)
					.on("Resource_Tag")
					.columns([index])
					.execute();
			}

			await kysely.schema
				.createTable("Inventory")
				.ifNotExists()
				.addColumn("id", $id, (col) => col.primaryKey())

				.addColumn("resourceId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Inventory] resourceId",
					["resourceId"],
					"Resource",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("amount", "float4", (col) => col.notNull())
				.addColumn("limit", "float4", (col) => col.notNull())

				.addColumn("type", "varchar(16)", (col) =>
					col.notNull().defaultTo("storage"),
				)

				.execute();

			await kysely.schema
				.createIndex("[Inventory] resourceId")
				.on("Inventory")
				.columns(["resourceId"])
				.execute();

			/**
			 * Region is a definition for the land (as an instance of Region).
			 *
			 * It defines size limits, available resources, also blueprints (alias buildings) can be built
			 * in specific regions.
			 *
			 * A region itself may have additional properties for later gameplay.
			 */
			await kysely.schema
				.createTable("Region")
				.ifNotExists()
				.addColumn("id", $id, (col) => col.primaryKey())

				.addColumn("name", "varchar(128)", (col) => col.notNull())

				/**
				 * 0-100% drop probability so a region will be placed on the map.
				 */
				.addColumn("probability", "integer", (col) => col.notNull())

				/**
				 * Absolute maximum of regions on the map (so there may be <= limit regions).
				 */
				.addColumn("limit", "integer", (col) => col.notNull())

				/**
				 * Image (base64 encoded).
				 */
				.addColumn("image", "text")

				.execute();

			/**
			 * Definition of available resources in the region; land resources (inventory) are generated
			 * based on this definition.
			 */
			await kysely.schema
				.createTable("Region_Inventory")
				.ifNotExists()
				.addColumn("id", $id, (col) => col.primaryKey())

				.addColumn("regionId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Region_Inventory] regionId",
					["regionId"],
					"Region",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("resourceId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Region_Inventory] resourceId",
					["resourceId"],
					"Resource",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				/**
				 * Generated amount of resource in the region.
				 */
				.addColumn("minAmount", "float4", (col) => col.notNull())
				.addColumn("maxAmount", "float4", (col) => col.notNull())

				/**
				 * If a resource is renewable, this limit defines how much of the resource can be
				 * stored in region's "inventory" (like amount of grown trees and so on).
				 */
				.addColumn("minLimit", "float4", (col) => col.notNull())
				.addColumn("maxLimit", "float4", (col) => col.notNull())

				.addUniqueConstraint("[Region_Inventory] regionId-resourceId", [
					"regionId",
					"resourceId",
				])

				.execute();

			for await (const index of ["regionId", "resourceId"]) {
				await kysely.schema
					.createIndex(`[Region_Inventory] ${index}`)
					.on("Region_Inventory")
					.columns([index])
					.execute();
			}

			/**
			 * Map is generated list of Lands for a player.
			 *
			 * When user starts a game, map name is taken and generated.
			 */
			await kysely.schema
				.createTable("Map")
				.ifNotExists()
				.addColumn("id", $id, (col) => col.primaryKey())

				.addColumn("userId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Map] userId",
					["userId"],
					"User",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("name", "varchar(128)", (col) => col.notNull())

				.addUniqueConstraint("[Map] userId-name", ["userId", "name"])

				.execute();

			await kysely.schema
				.createIndex("[Map] userId")
				.on("Map")
				.columns(["userId"])
				.execute();

			await kysely.schema
				.createTable("Cycle")
				.ifNotExists()
				.addColumn("id", $id, (col) => col.primaryKey())

				.addColumn("userId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Cycle] userId",
					["userId"],
					"User",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("mapId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Cycle] mapId",
					["mapId"],
					"Map",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("stamp", "datetime", (col) =>
					col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
				)

				.execute();

			for await (const index of ["userId", "mapId"]) {
				await kysely.schema
					.createIndex(`[Cycle] ${index}`)
					.on("Cycle")
					.columns([index])
					.execute();
			}

			await kysely.schema
				.createTable("Land")
				.ifNotExists()
				.addColumn("id", $id, (col) => col.primaryKey())

				.addColumn("mapId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Land] mapId",
					["mapId"],
					"Map",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("regionId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Land] regionId",
					["regionId"],
					"Region",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				/**
				 * Game is rendered in a grid, so the position only tells an order
				 * of lands, rest of computations are done by the browser.
				 */
				.addColumn("position", "integer", (col) => col.notNull())

				.execute();

			for await (const index of ["mapId", "regionId"]) {
				await kysely.schema
					.createIndex(`[Land] ${index}`)
					.on("Land")
					.columns([index])
					.execute();
			}

			/**
			 * Each land have it's own generated inventory.
			 */
			await kysely.schema
				.createTable("Land_Inventory")
				.ifNotExists()
				.addColumn("id", $id, (col) => col.primaryKey())

				.addColumn("landId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Land_Inventory] landId",
					["landId"],
					"Land",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("inventoryId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Land_Inventory] inventoryId",
					["inventoryId"],
					"Inventory",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addUniqueConstraint("[Land_Inventory] landId-inventoryId", [
					"landId",
					"inventoryId",
				])

				.execute();

			for await (const index of ["landId", "inventoryId"]) {
				await kysely.schema
					.createIndex(`[Land_Inventory] ${index}`)
					.on("Land_Inventory")
					.columns([index])
					.execute();
			}

			/**
			 * Blueprint is a definition for the building; all the buildings are pointing to it's blueprint.
			 *
			 * Idea is when blueprint is changed, all buildings are changed as well.
			 */
			await kysely.schema
				.createTable("Blueprint")
				.ifNotExists()
				.addColumn("id", $id, (col) => col.primaryKey())

				.addColumn("name", "varchar(64)", (col) => col.notNull())

				/**
				 * Number of cycles required to build this building
				 */
				.addColumn("cycles", "integer", (col) => col.notNull())

				/**
				 * Sort blueprints by this number (so the player can see buildings in right order).
				 */
				.addColumn("sort", "integer", (col) => col.notNull())
				/**
				 * Limit number of buildings a player can build.
				 */
				.addColumn("limit", "integer", (col) => col.notNull().defaultTo(1))

				/**
				 * Image (base64 encoded).
				 */
				.addColumn("image", "text")

				.addUniqueConstraint("[Blueprint] name", ["name"])

				.execute();

			await kysely.schema
				.createTable("Blueprint_Region")
				.ifNotExists()
				.addColumn("id", $id, (col) => col.primaryKey())

				.addColumn("blueprintId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Blueprint_Region] blueprintId",
					["blueprintId"],
					"Blueprint",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("regionId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Blueprint_Region] regionId",
					["regionId"],
					"Region",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addUniqueConstraint("[Blueprint_Region] blueprintId-regionId", [
					"blueprintId",
					"regionId",
				])

				.execute();

			await kysely.schema
				.createTable("Blueprint_Inventory")
				.ifNotExists()
				.addColumn("id", $id, (col) => col.primaryKey())

				.addColumn("blueprintId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Blueprint_Inventory] blueprintId",
					["blueprintId"],
					"Blueprint",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)
				.addColumn("inventoryId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Blueprint_Inventory] inventoryId",
					["inventoryId"],
					"Inventory",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addUniqueConstraint("[Blueprint_Inventory] blueprintId-inventoryId", [
					"blueprintId",
					"inventoryId",
				])

				.execute();

			/**
			 * Defines resources available for production in the building (blueprint).
			 */
			await kysely.schema
				.createTable("Blueprint_Production")
				.ifNotExists()
				.addColumn("id", $id, (col) => col.primaryKey())

				/**
				 * Which blueprint is this production for (building).
				 */
				.addColumn("blueprintId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Blueprint_Production] blueprintId",
					["blueprintId"],
					"Blueprint",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				/**
				 * Which resource is produced.
				 */
				.addColumn("resourceId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Blueprint_Production] resourceId",
					["resourceId"],
					"Resource",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				/**
				 * Amount of resource produced in specified cycles.
				 */
				.addColumn("amount", "float4", (col) => col.notNull())
				/**
				 * Amount of cycles to produce a thing
				 */
				.addColumn("cycles", "integer", (col) => col.notNull())

				.execute();

			/**
			 * Defines resources required to build the building (blueprint).
			 */
			await kysely.schema
				.createTable("Blueprint_Requirement")
				.ifNotExists()
				.addColumn("id", $id, (col) => col.primaryKey())

				.addColumn("blueprintId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Blueprint_Requirement] blueprintId",
					["blueprintId"],
					"Blueprint",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("resourceId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Blueprint_Requirement] resourceId",
					["resourceId"],
					"Resource",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("amount", "float4", (col) => col.notNull())
				/**
				 * If true, it's enough to have the resource, by it's not consumed on build.
				 */
				.addColumn("passive", "boolean", (col) => col.notNull())

				.addUniqueConstraint(
					"[Blueprint_Requirement] blueprintId-requirementId",
					["blueprintId", "resourceId"],
				)

				.execute();

			/**
			 * Blueprint may require another blueprints to be built before.
			 */
			await kysely.schema
				.createTable("Blueprint_Dependency")
				.ifNotExists()
				.addColumn("id", $id, (col) => col.primaryKey())

				.addColumn("blueprintId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Blueprint_Dependency] blueprintId",
					["blueprintId"],
					"Blueprint",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("dependencyId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Blueprint_Dependency] dependencyId",
					["dependencyId"],
					"Blueprint",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addUniqueConstraint(
					"[Blueprint_Dependency] blueprintId-dependencyId",
					["blueprintId", "dependencyId"],
				)

				.execute();

			/**
			 * List of conflicting blueprints: when any of them are built, "blueprintId" won't appear at all.
			 */
			await kysely.schema
				.createTable("Blueprint_Conflict")
				.ifNotExists()
				.addColumn("id", $id, (col) => col.primaryKey())

				.addColumn("blueprintId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Blueprint_Conflict] blueprintId",
					["blueprintId"],
					"Blueprint",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("conflictId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Blueprint_Conflict] conflictId",
					["conflictId"],
					"Blueprint",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addUniqueConstraint("[Blueprint_Conflict] blueprintId-conflictId", [
					"blueprintId",
					"conflictId",
				])

				.execute();

			/**
			 * Defines resources required to produce a resource defined in production line.
			 */
			await kysely.schema
				.createTable("Blueprint_Production_Requirement")
				.ifNotExists()
				.addColumn("id", $id, (col) => col.primaryKey())

				.addColumn("blueprintProductionId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Blueprint_Production_Requirement] blueprintProductionId",
					["blueprintProductionId"],
					"Blueprint_Production",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("resourceId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Blueprint_Production_Requirement] resourceId",
					["resourceId"],
					"Resource",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("amount", "float4", (col) => col.notNull())
				/**
				 * If true, it's enough to have the resource, by it's not consumed on build.
				 */
				.addColumn("passive", "boolean", (col) => col.notNull())

				.addUniqueConstraint(
					"[Blueprint_Production_Requirement] blueprintProductionId-resourceId",
					["blueprintProductionId", "resourceId"],
				)

				.execute();

			/**
			 * Defines which blueprints are required to even enable (display) the production
			 * line.
			 */
			await kysely.schema
				.createTable("Blueprint_Production_Dependency")
				.ifNotExists()
				.addColumn("id", $id, (col) => col.primaryKey())

				.addColumn("blueprintProductionId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Blueprint_Production_Dependency] blueprintProductionId",
					["blueprintProductionId"],
					"Blueprint_Production",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("blueprintId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Blueprint_Production_Dependency] blueprintId",
					["blueprintId"],
					"Blueprint",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addUniqueConstraint(
					"[Blueprint_Production_Dependency] blueprintProductionId-blueprintId",
					["blueprintProductionId", "blueprintId"],
				)

				.execute();

			/**
			 * Defines which resources must be present to even display the production line.
			 *
			 * Idea is something like "do you have more than 30 research points in forestery, so you can
			 * run improved woodcutting?"
			 *
			 * Those resources are "passive", thus are not deducted from the inventory.
			 */
			await kysely.schema
				.createTable("Blueprint_Production_Resource")
				.ifNotExists()
				.addColumn("id", $id, (col) => col.primaryKey())

				.addColumn("blueprintProductionId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Blueprint_Production_Dependency] blueprintProductionId",
					["blueprintProductionId"],
					"Blueprint_Production",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("resourceId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Blueprint_Production_Dependency] resourceId",
					["resourceId"],
					"Resource",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				/**
				 * Amount of resource required to display the production line.
				 */
				.addColumn("amount", "float4", (col) => col.notNull())

				.addUniqueConstraint(
					"[Blueprint_Production_Dependency] blueprintProductionId-resourceId",
					["blueprintProductionId", "resourceId"],
				)

				.execute();

			/**
			 * This is resource production queue.
			 */
			await kysely.schema
				.createTable("Production")
				.ifNotExists()
				.addColumn("id", $id, (col) => col.primaryKey())

				/**
				 * Owner of this queue item.
				 */
				.addColumn("userId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Production] userId",
					["userId"],
					"User",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("buildingId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Production] buildingId",
					["buildingId"],
					"Building",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("blueprintProductionId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Production] blueprintProductionId",
					["blueprintProductionId"],
					"Blueprint_Production",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("cycles", "integer", (col) => col.notNull())
				.addColumn("cycle", "integer", (col) => col.notNull())

				.execute();

			/**
			 * Defines queue of buildings to be built.
			 */
			await kysely.schema
				.createTable("Construction")
				.ifNotExists()
				.addColumn("id", $id, (col) => col.primaryKey())

				/**
				 * Owner of this queue item.
				 */
				.addColumn("userId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Construction] userId",
					["userId"],
					"User",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				/**
				 * If true, this building is planned, but not in the construction queue yet; user is
				 * allowed to move it around. Inventory is deducted in this time.
				 */
				.addColumn("plan", "boolean", (col) => col.notNull().defaultTo(true))

				.addColumn("cycles", "integer", (col) => col.notNull())
				.addColumn("cycle", "integer", (col) => col.notNull())

				.execute();

			await kysely.schema
				.createTable("Plot")
				.ifNotExists()
				.addColumn("id", $id, (col) => col.primaryKey())

				.addColumn("userId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Plot] userId",
					["userId"],
					"User",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("mapId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Plot] mapId",
					["mapId"],
					"Map",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("landId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Plot] landId",
					["landId"],
					"Land",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				/**
				 * Game is rendered in a grid, so the position only tells an order
				 * of plots, rest of computations are done by the browser.
				 */
				.addColumn("position", "integer", (col) => col.notNull())

				.execute();

			/**
			 * This is a building instance belonging to a player.
			 */
			await kysely.schema
				.createTable("Building")
				.ifNotExists()
				.addColumn("id", $id, (col) => col.primaryKey())

				.addColumn("userId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Building] userId",
					["userId"],
					"User",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("plotId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Building] plotId",
					["plotId"],
					"Plot",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("blueprintId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Building] blueprintId",
					["blueprintId"],
					"Blueprint",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("constructionId", $id)
				.addForeignKeyConstraint(
					"[Building] constructionId",
					["constructionId"],
					"Construction",
					["id"],
					(c) => c.onDelete("set null").onUpdate("set null"),
				)

				.addColumn("landId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Building] landId",
					["landId"],
					"Land",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				/**
				 * When set, one time production is scheduled with a cycle (and free production slot).
				 *
				 * One-time production take precedence over recurring production.
				 */
				.addColumn("productionId", $id)
				.addForeignKeyConstraint(
					"[Building] productionId",
					["productionId"],
					"Blueprint_Production",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)
				/**
				 * When set, recurring production is scheduled every time a free production slot is available.
				 */
				.addColumn("recurringProductionId", $id)
				.addForeignKeyConstraint(
					"[Building] recurringProductionId",
					["recurringProductionId"],
					"Blueprint_Production",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				/**
				 * Flag telling if building conditions are valid: this is used to control if a building
				 * can produce resources (so e.g. when there are overlapping buildings, production is disabled).
				 */
				.addColumn("valid", "boolean", (col) => col.notNull().defaultTo(true))

				.execute();

			for await (const index of [
				"userId",
				"blueprintId",
				"constructionId",
				"landId",
				"productionId",
				"recurringProductionId",
			]) {
				await kysely.schema
					.createIndex(`[Building] ${index}`)
					.on("Building")
					.columns([index])
					.execute();
			}

			await kysely.schema
				.createTable("Building_Inventory")
				.ifNotExists()
				.addColumn("id", $id, (col) => col.primaryKey())

				.addColumn("buildingId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Building_Inventory] buildingId",
					["buildingId"],
					"Building",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)
				.addColumn("inventoryId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Building_Inventory] inventoryId",
					["inventoryId"],
					"Inventory",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addUniqueConstraint("[Building_Inventory] buildingId-inventoryId", [
					"buildingId",
					"inventoryId",
				])

				.execute();

			/**
			 * Cache table for pre-computed connected buildings.
			 *
			 * Because routes are recursive, it's easier to cache them.
			 */
			await kysely.schema
				.createTable("Building_To_Building")
				.ifNotExists()
				.addColumn("id", $id, (col) => col.primaryKey())

				.addColumn("userId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Building_To_Building] userId",
					["userId"],
					"User",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)
				.addColumn("mapId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Building_To_Building] mapId",
					["mapId"],
					"Map",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("buildingId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Building_To_Building] buildingId",
					["buildingId"],
					"Building",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)
				.addColumn("linkId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Building_To_Building] linkId",
					["linkId"],
					"Building",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addUniqueConstraint("[Building_To_Building] buildingId-linkId", [
					"buildingId",
					"linkId",
				])

				.execute();

			for await (const index of ["userId", "mapId", "buildingId", "linkId"]) {
				await kysely.schema
					.createIndex(`[Building_To_Building] ${index}`)
					.on("Building_To_Building")
					.columns([index])
					.execute();
			}

			/**
			 * Just piece of road (so it could get rendered).
			 */
			await kysely.schema
				.createTable("Road")
				.ifNotExists()
				.addColumn("id", $id, (col) => col.primaryKey())

				.addColumn("plotId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Road] plotId",
					["plotId"],
					"Plot",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.execute();

			await kysely.schema
				.createTable("Supply")
				.ifNotExists()
				.addColumn("id", $id, (col) => col.primaryKey())

				.addColumn("userId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Supply] userId",
					["userId"],
					"User",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("mapId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Supply] mapId",
					["mapId"],
					"Map",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("buildingId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Supply] buildingId",
					["buildingId"],
					"Building",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("resourceId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Supply] resourceId",
					["resourceId"],
					"Resource",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addUniqueConstraint("[Supply] buildingId-resourceId", [
					"buildingId",
					"resourceId",
				])

				.execute();

			await kysely.schema
				.createTable("Demand")
				.ifNotExists()
				.addColumn("id", $id, (col) => col.primaryKey())

				.addColumn("userId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Transport] userId",
					["userId"],
					"User",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("mapId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Transport] mapId",
					["mapId"],
					"Map",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("buildingId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Demand] buildingId",
					["buildingId"],
					"Building",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("resourceId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Demand] resourceId",
					["resourceId"],
					"Resource",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				/**
				 * Requested amount of resources.
				 */
				.addColumn("amount", "float4", (col) => col.notNull())
				/**
				 * Priority of this demand. Higher number, higher priority.
				 */
				.addColumn("priority", "integer", (col) => col.notNull().defaultTo(0))

				.addColumn("type", "varchar(16)", (col) =>
					col.notNull().defaultTo("storage"),
				)

				.addUniqueConstraint("[Demand] buildingId-resourceId", [
					"buildingId",
					"resourceId",
				])

				.execute();

			/**
			 * Resource transport between buildings.
			 *
			 * This may be seen as a transport route.
			 *
			 * When a resource is successfully moved, it gets deleted from the transport
			 * (so only current transport list stays for next cycle).
			 */
			await kysely.schema
				.createTable("Transport")
				.ifNotExists()
				.addColumn("id", $id, (col) => col.primaryKey())

				.addColumn("userId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Transport] userId",
					["userId"],
					"User",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("mapId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Transport] mapId",
					["mapId"],
					"Map",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				/**
				 * Which resource
				 */
				.addColumn("resourceId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Transport] resourceId",
					["resourceId"],
					"Resource",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				/**
				 * Where a resource currently is
				 */
				.addColumn("roadId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Transport] roadId",
					["roadId"],
					"Road",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("sourceId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Transport] sourceId",
					["sourceId"],
					"Building",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				.addColumn("targetId", $id, (col) => col.notNull())
				.addForeignKeyConstraint(
					"[Transport] targetId",
					["targetId"],
					"Building",
					["id"],
					(c) => c.onDelete("cascade").onUpdate("cascade"),
				)

				/**
				 * Amount of transferred resources.
				 */
				.addColumn("amount", "float4", (col) => col.notNull())

				.addColumn("type", "varchar(16)", (col) =>
					col.notNull().defaultTo("storage"),
				)

				.execute();

			for await (const index of [
				"userId",
				"mapId",
				"resourceId",
				"roadId",
				"sourceId",
				"targetId",
			]) {
				await kysely.schema
					.createIndex(`[Transport] ${index}`)
					.on("Transport")
					.columns([index])
					.execute();
			}
		}
	},
});
