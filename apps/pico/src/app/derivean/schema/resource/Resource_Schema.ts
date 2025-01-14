import { FilterSchema } from "@use-pico/common";
import { z } from "zod";
import { withResourceSchema } from "~/app/derivean/db/sdk";

export const Resource_Schema = withResourceSchema({
	shape: z.object({
		name: z.string().min(1),
		tagIds: z.array(z.string()).optional(),
	}),
	filter: FilterSchema.merge(
		z.object({
			name: z.string().optional(),
		}),
	),
});

export type Resource_Schema = typeof Resource_Schema;
