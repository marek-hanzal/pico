import {z}                 from "@pico/utils";
import {RpcResponseSchema} from "./RpcResponseSchema";

export const RpcBulkResponseSchema = z.object({
    bulk: z.record(RpcResponseSchema),
});
export type RpcBulkResponseSchema = typeof RpcBulkResponseSchema;
export namespace RpcBulkResponseSchema {
    export type Type = z.infer<RpcBulkResponseSchema>;
}
