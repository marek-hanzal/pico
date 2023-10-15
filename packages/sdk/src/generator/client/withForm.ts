import {withSourceFile}  from "@pico/generator";
import {normalize}       from "node:path";
import {type IGenerator} from "../../api/IGenerator";

export interface IWithFormParams {
    forms: IWithFormParams.IForm[];
}

export namespace IWithFormParams {
    export interface IForm {
        /**
         * Base name exported (used to name all exported objects)
         */
        name: string;
        type?: "common" | "dto";
        translation: {
            namespace: string;
        };
        packages: IPackages;
        withTrpc?: IWithTrpc;
    }

    export interface IWithTrpc {
        /**
         * Name of the Source provider
         */
        source: string;
        /**
         * Which mutation to use
         */
        use: string;
    }

    export interface IPackages {
        /**
         * Package used to import all schema-related types (ISource implementation, IWhere and so on, can be generated by @pico).
         */
        schema: string;
    }
}

export const withForm: IGenerator<IWithFormParams> = async (
    {
        barrel,
        directory,
        params: {forms}
    }) => {
    forms.forEach((
        {
            name,
            type = "common",
            translation,
            withTrpc,
            packages
        }) => {
        console.log(`- Generating [withForm] [${name}]`);

        withSourceFile()
            .withImports({
                imports: {
                    "@pico/form-client": [
                        "createFormContext",
                    ],
                    [packages.schema]:   [
                        `type I${name}FormSchemaType`,
                    ],
                },
            })
            .withConsts({
                exports: {
                    [`${name}FormStoreContext`]: {
                        body: `
createFormContext<I${name}FormSchemaType>({
    name: "${name}Form",
})
                        `,
                    },
                }
            })
            .saveTo({
                file:   normalize(`${directory}/context/${name}FormStoreContext.tsx`),
                barrel: false,
            });

        withSourceFile()
            .withImports({
                imports: {
                    "@pico/form-client": [
                        "createMantineFormContext",
                    ],
                    [packages.schema]:   [
                        `type I${name}FormSchemaType`,
                    ],
                },
            })
            .withConsts({
                exports: {
                    [`${name}MantineFormContext`]: {
                        body: `createMantineFormContext<I${name}FormSchemaType>()`,
                    },
                },
            })
            .saveTo({
                file:   normalize(`${directory}/context/${name}MantineFormContext.tsx`),
                barrel: false,
            });

        withSourceFile()
            .withImports({
                imports: {
                    "@pico/form-client":                    [
                        "type IWithInputProps",
                        "WithInput",
                    ],
                    [packages.schema]:                      [
                        `type I${name}FormSchemaType`,
                    ],
                    "react":                                [
                        "type FC",
                    ],
                    [`../context/${name}FormStoreContext`]: [
                        `${name}FormStoreContext`,
                    ],
                },
            })
            .withConsts({
                exports: {
                    [`${name}Input`]: {
                        type: `FC<Omit<IWithInputProps<I${name}FormSchemaType>, "FormContext">>`,
                        body: `
props => {
    return <WithInput
        FormContext={${name}FormStoreContext}
        {...props}
    />;
}
                            `,
                    },
                },
            })
            .saveTo({
                file:   normalize(`${directory}/form/${name}Input.tsx`),
                barrel: false,
            });

        withSourceFile()
            .withImports({
                imports: {
                    "@pico/form-client":                      type === "common" ? [
                        "BaseForm",
                        "type IBaseFormProps",
                    ] : [
                        "DtoForm as BaseForm",
                        "type IDtoFormProps as IBaseFormProps",
                    ],
                    "react":                                  [
                        "type FC",
                    ],
                    [packages.schema]:                        [
                        `type I${name}FormSchemaType`,
                    ],
                    [`../context/${name}FormStoreContext`]:   [
                        `${name}FormStoreContext`,
                    ],
                    [`../context/${name}MantineFormContext`]: [
                        `${name}MantineFormContext`,
                    ],
                },
            })
            .withImports({
                imports: {
                    [packages.schema]: [
                        `${name}FormSchema`,
                    ],
                },
            })
            .withConsts({
                exports: {
                    [`${name}BaseForm`]: {
                        type: `FC<I${name}BaseFormProps>`,
                        // language=text
                        body: `
props => {
    return <BaseForm<I${name}FormSchemaType>
        MantineContext={${name}MantineFormContext}
        schemas={${name}FormSchema}
        FormContext={${name}FormStoreContext}
        withTranslation={{
            namespace: "${translation.namespace}",
            label:     "${name}BaseForm",
        }}
        {...props}
    />;
}
                        `,
                    },
                },
            })
            .withInterfaces({
                exports: {
                    [`I${name}BaseFormProps`]: {
                        extends: [
                            {
                                type: `Omit<IBaseFormProps<I${name}FormSchemaType>, "FormContext" | "MantineContext" | "withTranslation">`,
                            },
                        ],
                    },
                },
            })
            .saveTo({
                file: normalize(`${directory}/form/${name}BaseForm.tsx`),
                barrel,
            });

        if (withTrpc) {
            withSourceFile()
                .withImports({
                    imports: {
                        "@pico/form":                                 [
                            "type ITrpcFormProps",
                        ],
                        "@pico/utils-client":                         [
                            "BlockStore",
                        ],
                        [packages.schema]:                            [
                            `type I${name}FormSchemaType`,
                        ],
                        "react":                                      [
                            "type FC"
                        ],
                        [`./${name}BaseForm`]:                        [
                            `type I${name}BaseFormProps`,
                            `${name}BaseForm`,
                        ],
                        [`../trpc/use${withTrpc.source}Invalidator`]: [
                            `use${withTrpc.source}Invalidator`,
                        ],
                        [`../source/${withTrpc.source}Source`]:       [
                            `${withTrpc.source}Source`,
                        ],
                    },
                })
                .withInterfaces({
                    exports: {
                        [`I${name}TrpcFormProps`]: {
                            extends: [
                                {
                                    type: `I${name}BaseFormProps`,
                                },
                                {
                                    type: `ITrpcFormProps<I${name}FormSchemaType>`,
                                },
                            ],
                        },
                    },
                })
                .withConsts({
                    exports: {
                        [`${name}TrpcForm`]: {
                            type: `FC<I${name}TrpcFormProps>`,
                            body: `
({onSuccess, onError, onSettled, ...props}) => {
    const {block} = BlockStore.use$() || {block: () => null};
    const mutation = ${withTrpc.source}Source.repository.${withTrpc.use}();
    const invalidator = use${withTrpc.source}Invalidator();
    return <${name}BaseForm
        onSubmit={({request, form, values, onDefaultSubmit}) => {
            block(true);
            mutation.mutate(request, {
                onSuccess: dto => {
                    onDefaultSubmit();
                    invalidator();
                    onSuccess?.({dto, values, form});
                },
                onError: error => {
                    onError?.({error, values, form});                    
                },
                onSettled: () => {
                    block(false);
                    onSettled?.({values, form});
                },
            });
        }}
        {...props}
    />;
}
                            `,
                        }
                    },
                })
                .saveTo({
                    file: normalize(`${directory}/form/${name}TrpcForm.tsx`),
                    barrel,
                });
        }
    });
};
