import {type PicoSchema}     from "../../api/PicoSchema";
import {type OptionalSchema} from "../../api/schema/OptionalSchema";

export function withOptional<
    TWrapped extends PicoSchema,
    TDefault extends PicoSchema.Input<TWrapped> | undefined = undefined,
>(
    wrapped: TWrapped,
    default$?: TDefault | (() => TDefault),
): OptionalSchema<TWrapped, TDefault> {
    return {
        schema:  "optional",
        partial: true,
        wrapped,
        get default() {
            return typeof default$ === "function"
                ? (default$ as () => TDefault)()
                : (default$ as TDefault);
        },
        _parse(input, info) {
            const value = input === undefined ? this.default : input;

            if (value === undefined) {
                return {output: value};
            }

            return wrapped._parse(value, info);
        },
        async _parseAsync(input, info) {
            return this._parse(input, info);
        },
    };
}
