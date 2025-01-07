import {
    FilterSchema,
    IdentitySchema,
    translator,
    withSourceSchema,
} from "@use-pico/common";
import { z } from "zod";
import { ResourceRequirementSchema } from "~/app/derivean/resource/requirement/ResourceRequirementSchema";

const entity = IdentitySchema.merge(
	z.object({
		resourceId: z.string().min(1),
		cycles: z.number().int().nonnegative(),
	}),
);

export const BuildingBaseSchema = withSourceSchema({
	entity,
	output: entity.merge(
		z.object({
			name: z.string().min(1),
			requirements: z.array(ResourceRequirementSchema.output),
		}),
	),
	shape: z.object({
		resourceId: z.string().min(1),
		cycles: z.union([
			z.number().int().nonnegative(),
			z
				.string()
				.transform((value) => parseInt(value, 10))
				.refine((value) => !isNaN(value), {
					message: translator.text("Cycles must be a number"),
				}),
		]),
	}),
	filter: FilterSchema.merge(
		z.object({
			name: z.string().optional(),
		}),
	),
	sort: ["name"],
});

export type BuildingBaseSchema = typeof BuildingBaseSchema;
