import {
    FilterSchema,
    IdentitySchema,
    withRepositorySchema,
} from "@use-pico/common";
import { z } from "zod";

export const ResourceTagSchema = withRepositorySchema({
	entity: IdentitySchema.merge(
		z.object({
			resourceId: z.string().min(1),
			tagId: z.string().min(1),
		}),
	),
	shape: z.object({
		resourceId: z.string().min(1),
		tagId: z.string().min(1),
	}),
	filter: FilterSchema.merge(
		z.object({
			resourceId: z.string().optional(),
			tagId: z.string().optional(),
		}),
	),
});

export type ResourceTagSchema = typeof ResourceTagSchema;
