import {withSourceFile} from "@pico/generator";
import {normalize}      from "node:path";
import {IGenerator}     from "../../api/IGenerator";

export interface IWithSelectParams {
    selects: IWithSelectParams.ISelect[];
}

export namespace IWithSelectParams {
    export interface ISelect {
        /**
         * Base name exported (used to name all exported objects)
         */
        name: string;
        packages: IPackages;
    }

    export interface IPackages {
        /**
         * Package used to import all schema-related types (ISource implementation, IWhere and so on, can be generated by @pico).
         */
        schema: string;
    }
}

export const withSelect: IGenerator<IWithSelectParams> = async (
    {
        barrel,
        directory,
        params: {selects}
    }) => {
    selects.forEach(({
                         name,
                         packages
                     }) => {
        console.log(`- Generating [withSelect] [${name}]`);

        withSourceFile()
            .withImports({
                imports: {
                    "@pico/form":                      [
                        "type IFormSchemaType",
                    ],
                    "@pico/form-client":               [
                        "type ISourceSelectProps",
                        "SourceSelect",
                    ],
                    [`../selection/${name}Selection`]: [
                        `${name}Selection`,
                    ],
                    [`../source/${name}Source`]:       [
                        `${name}Source as Source`,
                    ],
                },
            })
            .withImports({
                imports: {
                    [packages.schema]: [
                        `type I${name}SourceSchema as SourceSchema`,
                    ],
                }
            })
            .withInterfaces({
                exports: {
                    [`I${name}SourceSelect<TFormSchemaType extends IFormSchemaType>`]: {
                        extends: [
                            {
                                type: `Omit<ISourceSelectProps<TFormSchemaType, SourceSchema>, "SelectionContext" | "Source">`,
                            }
                        ],
                    }
                },
            })
            .withConsts({
                exports: {
                    [`${name}SourceSelect`]: {
                        // language=text
                        body: `
<TFormSchemaType extends IFormSchemaType>(props: I${name}SourceSelect<TFormSchemaType>) => {
    return <SourceSelect<TFormSchemaType, SourceSchema>
        SelectionContext={${name}Selection}
        Source={Source}
        {...props}
    />
}
                        `,
                    }
                },
            })
            .saveTo({
                file: normalize(`${directory}/select/${name}SourceSelect.tsx`),
                barrel,
            });

        withSourceFile()
            .withImports({
                imports: {
                    "@pico/form":                           [
                        "type IFormSchemaType",
                    ],
                    "@pico/form-client":                    [
                        "type ISourceMultiSelectProps",
                        "SourceMultiSelect",
                    ],
                    [`../selection/${name}MultiSelection`]: [
                        `${name}MultiSelection`,
                    ],
                    [`../source/${name}Source`]:            [
                        `${name}Source as Source`,
                    ],
                },
            })
            .withImports({
                imports: {
                    [packages.schema]: [
                        `type I${name}SourceSchema as SourceSchema`,
                    ],
                }
            })
            .withInterfaces({
                exports: {
                    [`I${name}MultiSourceSelect<TFormSchemaType extends IFormSchemaType>`]: {
                        extends: [
                            {
                                type: `Omit<ISourceMultiSelectProps<TFormSchemaType, SourceSchema>, "SelectionContext" | "Source">`,
                            }
                        ],
                    }
                },
            })
            .withConsts({
                exports: {
                    [`${name}MultiSourceSelect`]: {
                        // language=text
                        body: `
<TFormSchemaType extends IFormSchemaType>(props: I${name}MultiSourceSelect<TFormSchemaType>) => {
    return <SourceMultiSelect<TFormSchemaType, SourceSchema>
        SelectionContext={${name}MultiSelection}
        Source={Source}
        {...props}
    />
}
                        `,
                    }
                },
            })
            .saveTo({
                file: normalize(`${directory}/select/${name}SourceMultiSelect.tsx`),
                barrel,
            });
    });
};
