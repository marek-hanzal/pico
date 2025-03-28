import { FilterSchema, translator, withIntSchema } from "@use-pico/common";
import { z } from "zod";
import { withResourceSchema } from "~/app/derivean/db/sdk";

export const ResourceSchema = withResourceSchema({
	shape: z.object({
		name: z.string().min(1),
		weight: withIntSchema(),
		tagIds: z.array(z.string()).optional(),
		image: z
			.instanceof(FileList, { message: "You must upload a file." })
			.transform((files) => files[0])
			.refine(
				(file) => {
					if (file) {
						file.size < 5 * 1024 * 1024;
					}
					return true;
				},
				{
					message: translator.text("File size must be less than 5MB"),
				},
			)
			.refine(
				(file) => {
					if (file) {
						return ["image/png", "image/jpeg", "image/webp"].includes(
							file.type,
						);
					}
					return true;
				},
				{
					message: "Only PNG/JPEG/WEBP files are allowed.",
				},
			)
			.optional(),
	}),
	filter: FilterSchema.merge(
		z.object({
			name: z.string().optional(),
		}),
	),
});

export type ResourceSchema = typeof ResourceSchema;
