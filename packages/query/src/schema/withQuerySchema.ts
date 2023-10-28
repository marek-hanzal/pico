import {schema}             from "@use-pico/schema";
import {CursorSchema}       from "./CursorSchema";
import {type FilterSchema}  from "./FilterSchema";
import {type OrderBySchema} from "./OrderBySchema";
import {type QuerySchema}   from "./QuerySchema";

export namespace withQuerySchema {
    export interface Props<
        TFilterSchema extends FilterSchema,
        TOrderBySchema extends OrderBySchema,
    > {
        filter: TFilterSchema;
        orderBy: TOrderBySchema;
    }
}

export type withQuerySchema<
    TFilterSchema extends FilterSchema,
    TOrderBySchema extends OrderBySchema,
> = typeof withQuerySchema<TFilterSchema, TOrderBySchema>;

export const withQuerySchema = <
    TFilterSchema extends FilterSchema,
    TOrderBySchema extends OrderBySchema,
>({
      filter,
      orderBy,
  }: withQuerySchema.Props<TFilterSchema, TOrderBySchema>
): QuerySchema<TFilterSchema, TOrderBySchema> => {
    return schema(z => z.object({
        /**
         * Optional filter, which should be mandatory filter (for example, clientId on invoices)
         */
        filter: z.nullish(filter),
        /**
         * Optional filter saying more specific filter options (this is where application user puts
         * search/filters).
         */
        where: z.nullish(filter),
        orderBy: z.nullish(orderBy),
        cursor:  CursorSchema.nullish(),
    }));
};
