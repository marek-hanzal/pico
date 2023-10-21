"use client";

import {useParam}             from "@use-pico/navigation";
import {
    ErrorResponseSchema,
    FilterSchema,
    QueryResult,
    type WithQuery
}                             from "@use-pico/query";
import {
    type PicoSchema,
    type WithIdentitySchema
}                             from "@use-pico/schema";
import {WithEntity}           from "@use-pico/types";
import {Loader}               from "@use-pico/ui";
import {
    type FC,
    type ReactNode
}                             from "react";
import {type IWithFetchQuery} from "../api/IWithFetchQuery";

export namespace Fetch {
    export interface Props<
        TFilterSchema extends FilterSchema,
        TResponseSchema extends WithIdentitySchema,
    > {
        /**
         * Parameter name from "useParam"; optional
         */
        param?: string;
        /**
         * Override "useParam" and use provided identity
         */
        override?: string;
        filter?: PicoSchema.Output<TFilterSchema> | null;
        loader?: ReactNode;
        /**
         * Query to fetch entity
         */
        withQuery: IWithFetchQuery<TFilterSchema, TResponseSchema>;

        /**
         * Error renderer
         */
        WithError?: FC<WithErrorProps>;

        /**
         * Success renderer
         */
        WithSuccess: FC<WithSuccessProps<TResponseSchema>>;
        enabled?: boolean;
        options?: WithQuery.QueryOptions<TFilterSchema, TResponseSchema>;
    }

    export interface WithErrorProps {
        error: ErrorResponseSchema.Type;
    }

    export interface WithSuccessProps<TResponseSchema extends WithIdentitySchema> extends WithEntity.Schema<TResponseSchema> {
    }
}

export const Fetch = <
    TFilterSchema extends FilterSchema,
    TResponseSchema extends WithIdentitySchema,
>(
    {
        param = "id",
        override,
        filter,
        loader,
        withQuery,
        WithError = () => null,
        WithSuccess,
        enabled = true,
        options,
    }: Fetch.Props<TFilterSchema, TResponseSchema>
) => {
    const id = useParam(param, filter ? "-" : override);
    const result = withQuery.useQueryEx({
        request: filter || {
            id,
        },
        options: {
            ...options,
            enabled,
        },
    });
    return <QueryResult
        result={result}
        WithLoading={() => loader === undefined ? <Loader type={"dots"} size={"xs"}/> : loader}
        WithError={WithError}
        WithSuccess={({data}) => <WithSuccess entity={data}/>}
    />;
};
