import {withMutationSchema} from "@use-pico/source";
import {type z}             from "@use-pico/utils";
import {BulkQuerySchema}    from "./BulkQuerySchema";
import {BulkShapeSchema}    from "./BulkShapeSchema";

export const BulkMutationSchema = withMutationSchema({
    shape: BulkShapeSchema,
    query: BulkQuerySchema,
});
export type BulkMutationSchema = typeof BulkMutationSchema;
export namespace BulkMutationSchema {
    export type Type = z.infer<BulkMutationSchema>;
}
