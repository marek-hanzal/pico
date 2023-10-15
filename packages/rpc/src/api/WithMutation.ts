import {type WithMutation as IWithCoolMutation,} from "@pico/query";
import {
    type RequestSchema,
    type ResponseSchema
}                                                from "@pico/schema";

export interface WithMutation<
    TRequestSchema extends RequestSchema,
    TResponseSchema extends ResponseSchema,
> extends IWithCoolMutation<
    TRequestSchema,
    TResponseSchema
> {
    service: string;
}
