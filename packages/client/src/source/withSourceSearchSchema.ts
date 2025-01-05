import { fallback } from "@tanstack/zod-adapter";
import { CursorSchema, type FilterSchema } from "@use-pico/common";
import { z } from "zod";

export namespace withSourceSearchSchema {
	export interface Props<TFilterSchema extends FilterSchema> {
		filter: TFilterSchema;
	}
}

export const withSourceSearchSchema = <TFilterSchema extends FilterSchema>({
	filter,
}: withSourceSearchSchema.Props<TFilterSchema>) => {
	return z.object({
		filter: fallback(filter.optional(), undefined),
		cursor: fallback(CursorSchema, { page: 0, size: 15 }).default({
			page: 0,
			size: 15,
		}),
		selection: fallback(z.array(z.string()), []).default([]),
	});
};