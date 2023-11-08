"use client";

import {ButtonGroup}         from "@mantine/core";
import {tx}                  from "@use-pico/i18n";
import {
    type FilterSchema,
    type IQueryStore,
    type IWithMutation,
    type QuerySchema,
    withPassMutation
}                            from "@use-pico/query";
import {useStore}            from "@use-pico/store";
import {
    ActionIcon,
    Button,
    CloseIcon,
    CrossIcon,
    Drawer,
    DrawerButton,
    DrawerStore,
    DrawerStoreProvider,
    FilterIcon,
    FilterOffIcon,
    FilterOnIcon,
    Group
}                            from "@use-pico/ui";
import {mapEmptyToUndefined} from "@use-pico/utils";
import {Form}                from "./Form";

export namespace Filter {
    export interface Props<
        TFilterSchema extends FilterSchema
    > extends Omit<
        Form.Props<
            IWithMutation<TFilterSchema, TFilterSchema>
        >,
        "schema" | "onSuccess" | "withMutation"
    > {
        schema: {
            filter: TFilterSchema;
        },
        withQueryStore: IQueryStore.Store<QuerySchema<TFilterSchema, any>>;
    }
}

export const Filter = <TFilterSchema extends FilterSchema>(
    {
        schema: {filter},
        withQueryStore,
        ...props
    }: Filter.Props<TFilterSchema>
) => {
    const query = useStore(withQueryStore, (
        {
            filter,
            setFilter,
            isFilter,
            clearFilter,
            setCursor
        }) => ({
        filter,
        setFilter,
        isFilter,
        clearFilter,
        setCursor
    }));
    const drawer = useStore(DrawerStore, ({close}) => ({close}));

    return <DrawerStoreProvider>
        <Drawer
            drawerId={"filter"}
            size={"xl"}
            title={"title"}
            closeOnClickOutside={false}
        >
            <Form
                schema={filter}
                submitProps={{
                    leftSection: <FilterIcon/>,
                }}
                values={query.filter}
                withAutoClose={["filter"]}
                onSuccess={async (
                    {
                        values,
                    }) => {
                    query.setCursor(0);
                    query.setFilter(mapEmptyToUndefined(values));
                }}
                withMutation={withPassMutation({
                    key:    ["filter"],
                    schema: filter,
                })}
                leftSection={<>
                    <ButtonGroup>
                        <Button
                            variant={"subtle"}
                            leftSection={<CloseIcon/>}
                            onClick={() => {
                                drawer.close("filter");
                            }}
                        >
                            {tx()`Close`}
                        </Button>
                        <Button
                            variant={"subtle"}
                            leftSection={<FilterOffIcon/>}
                            onClick={() => {
                                query.clearFilter();
                                drawer.close("filter");
                            }}
                        >
                            {tx()`Clear filter`}
                        </Button>
                    </ButtonGroup>
                </>}
                {...props}
            />
        </Drawer>
        <Group gap={"xs"}>
            <DrawerButton
                drawerId={"filter"}
                variant={"subtle"}
                color={query.isFilter() ? "green.7" : undefined}
                leftSection={query.isFilter() ? <FilterOnIcon/> : <FilterOffIcon/>}
                label={"button"}
            />
            {query.isFilter() && <ActionIcon
                variant={"subtle"}
                onClick={() => {
                    query.setCursor(0);
                    query.clearFilter();
                }}
            >
                <CrossIcon/>
            </ActionIcon>}
        </Group>
    </DrawerStoreProvider>;
};
