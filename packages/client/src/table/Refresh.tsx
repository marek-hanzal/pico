import {
    cn,
    type FilterSchema,
    type OrderBySchema,
    type QuerySchema,
    type WithIdentitySchema
}                       from "@use-pico2/common";
import {LoaderIcon}     from "../icon/LoaderIcon";
import {RefreshIcon}    from "../icon/RefreshIcon";
import {useSourceQuery} from "../query/useSourceQuery";
import {Action}         from "../ui/Action";
import {Table}          from "./Table";

export namespace Refresh {
    export type Props<
        TColumns extends string,
        TQuerySchema extends QuerySchema<FilterSchema, OrderBySchema>,
        TSchema extends WithIdentitySchema,
    > =
        Pick<
            Table.Props<TColumns, TQuerySchema, TSchema>,
            "withSourceQuery" | "withQueryStore" | "refresh"
        >
        & cn.WithClass;
}

export const Refresh = <
    TColumns extends string,
    TQuerySchema extends QuerySchema<FilterSchema, OrderBySchema>,
    TSchema extends WithIdentitySchema,
>(
    {
        withQueryStore,
        withSourceQuery,
        refresh,
    }: Refresh.Props<TColumns, TQuerySchema, TSchema>
) => {
    const result = useSourceQuery({
        store:           withQueryStore,
        withSourceQuery: withSourceQuery,
        refetchInterval: refresh,
    });

    return <Action
        icon={{
            enabled:  RefreshIcon,
            disabled: RefreshIcon,
            loading:  LoaderIcon,
        }}
        cx={[
            "text-sky-500",
        ]}
        disabled={result.isFetching}
        loading={result.isFetching}
        onClick={() => result.refetch()}
    />;
};
