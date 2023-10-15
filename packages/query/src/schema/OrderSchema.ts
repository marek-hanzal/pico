import {z} from "@use-pico/utils";

export const OrderSchema = z.enum(["asc", "desc"]);
export type OrderSchema = typeof OrderSchema;
export namespace OrderSchema {
    export type Type = z.infer<OrderSchema>;
}
