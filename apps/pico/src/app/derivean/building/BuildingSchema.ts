import { FilterSchema, withIntSchema } from "@use-pico/common";
import { z } from "zod";
import { withBuildingSchema } from "~/app/derivean/db/sdk";

export const BuildingSchema = withBuildingSchema({
	shape: z.object({
		buildingBaseId: z.string().min(1),
		level: withIntSchema(),
	}),
	filter: FilterSchema.merge(
		z.object({
			userId: z.string().optional(),
			buildingBaseId: z.string().optional(),
			name: z.string().optional(),
		}),
	),
});

export type BuildingSchema = typeof BuildingSchema;
