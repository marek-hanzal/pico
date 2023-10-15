import {Translation}               from "@pico/i18n";
import {
    type FilterSchema,
    type OrderBySchema,
    WithIdentitySchema
}                                  from "@pico/query";
import {type WithSourceQuery}      from "@pico/rpc";
import {type IMultiSelectionStore} from "@pico/selection";
import {
    Alert,
    Divider,
    Group,
    Modal,
    ModalStoreProvider,
    Text
}                                  from "@pico/ui";
import {type z}                    from "@pico/utils";
import {type FC}                   from "react";
import {useController}             from "react-hook-form";
import type {ValuesSchema}         from "../schema/ValuesSchema";
import {InputEx}                   from "./InputEx";
import {MultiCommitButton}         from "./MultiQueryInput/MultiCommitButton";
import {WithMultiItem}             from "./MultiQueryInput/WithMultiItem";
import {CancelButton}              from "./QueryInput/CancelButton";
import {ClearButton}               from "./QueryInput/ClearButton";

export namespace MultiQueryInput {
    export interface Props<
        TValuesSchema extends ValuesSchema,
        TResponseSchema extends WithIdentitySchema,
        TFilterSchema extends FilterSchema,
        TOrderBySchema extends OrderBySchema,
    > extends InputEx.Props<TValuesSchema> {
        /**
         * Query used to fetch current entity.
         */
        withSourceQuery: WithSourceQuery<TResponseSchema, TFilterSchema, TOrderBySchema>;
        /**
         * Store used to manage selection of current entity.
         */
        MultiSelectionStore: IMultiSelectionStore<z.infer<TResponseSchema>>;
        /**
         * Component used to render a list of items to select from.
         */
        Selector: Selector<TResponseSchema>;
        /**
         * Render selected item.
         */
        Items: WithMultiItem.Items<TResponseSchema>;
        /**
         * Optional method used to generate filter to fetch an entity (if more complex filter is needed); defaults to an ID.
         */
        toFilter?: (values: string[]) => z.infer<TFilterSchema> | undefined;
        toOrderBy?: () => z.infer<TOrderBySchema> | undefined;
        onCommit?: MultiCommitButton.Props<TValuesSchema, TResponseSchema>["onCommit"];
        limit?: number;
    }

    export type Selector<TResponseSchema extends WithIdentitySchema> = FC<SelectorProps<TResponseSchema>>;

    export interface SelectorProps<TResponseSchema extends WithIdentitySchema> {
        /**
         * Access to currently selected item
         */
        MultiSelectionStore: IMultiSelectionStore<z.infer<TResponseSchema>>;
    }
}

export const MultiQueryInput = <
    TValuesSchema extends ValuesSchema,
    TResponseSchema extends WithIdentitySchema,
    TFilterSchema extends FilterSchema,
    TOrderBySchema extends OrderBySchema,
>(
    {
        withControl,
        schema,
        withSourceQuery,
        MultiSelectionStore,
        toFilter = idIn => ({idIn}),
        toOrderBy = () => undefined,
        Selector,
        Items,
        onCommit,
        limit = 3,
        ...props
    }: MultiQueryInput.Props<TValuesSchema, TResponseSchema, TFilterSchema, TOrderBySchema>
) => {
    const {
        field: {
                   value,
               },
    } = useController(withControl);
    const shape = (schema as any)?.shape[withControl.name];
    const result = withSourceQuery.useQueryEx({
        request: {
                     filter:  value ? toFilter(value) : {idIn: []},
                     orderBy: toOrderBy(),
                     /**
                      * @TODO Fix type
                      *
                      * For an unknown reason types here are quite broken, so temporal fix is use "any"; we're sure type
                      * is correct here as it's enforced on the input.
                      */
                 } as any,
    });

    return result.isLoading ? <InputEx
        withControl={withControl}
        schema={schema}
        isLoading
        {...props}
    /> : <MultiSelectionStore.Provider
        defaults={{
            /**
             * Two separate maps are necessary as the store would modify both maps unintentionally
             */
            items:     new Map(result.data?.map(item => [item.id, item])),
            selection: new Map(result.data?.map(item => [item.id, item])),
        }}
    >
        <ModalStoreProvider>
            <Modal
                modalId={"query-input"}
                size={"75%"}
                title={<>
                    <Text
                        fw={"500"}
                        span
                    >
                        <Translation withLabel={`${withControl.name}.selection.label`}/>
                    </Text>
                    {shape && !shape.isOptional() && <Text
                        ml={4}
                        c={"red"}
                        span
                    >*</Text>}
                </>}
            >
                {result.data && ((result.data?.length || 0) > 0) && <>
                    <Alert
                        title={<Translation namespace={"common.selection"} withLabel={"selected-items.label"}/>}
                    >
                        <Items
                            limit={8}
                            items={result.data}
                        />
                    </Alert>
                    <Divider mt={"sm"}/>
                </>}
                <Selector
                    MultiSelectionStore={MultiSelectionStore}
                />
                <Divider my={"sm"}/>
                <Group gap={"md"} justify={"apart"} grow>
                    <Group gap={"sm"}>
                        <CancelButton
                            SelectionStore={MultiSelectionStore}
                        />
                        <ClearButton
                            SelectionStore={MultiSelectionStore}
                        />
                    </Group>
                    <MultiCommitButton
                        withControl={withControl}
                        MultiSelectionStore={MultiSelectionStore}
                        onCommit={onCommit}
                    />
                </Group>
            </Modal>
            <WithMultiItem
                isLoading={result.isFetching}
                withControl={withControl}
                schema={schema}
                Items={Items}
                MultiSelectionStore={MultiSelectionStore}
                limit={limit}
                {...props}
            />
        </ModalStoreProvider>
    </MultiSelectionStore.Provider>;
};
