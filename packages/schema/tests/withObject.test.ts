import {
    describe,
    expect,
    test
} from "vitest";
import {
    parse,
    ParseError,
    type PicoSchema,
    schema
} from "../src";

describe("withObject", () => {
    test("should pass only objects", () => {
        const schema1 = schema(z => z.object({
            key1: z.string,
            key2: z.number,
        }));
        const input1: PicoSchema.Output<typeof schema1> = {
            key1: "test",
            key2: 123
        };
        const output1 = parse(schema1, input1);
        expect(output1).toEqual(input1);
        const input2 = {
            ...input1,
            key3: null
        };
        const outpu2 = parse(schema1, input2);
        expect(outpu2).toEqual(input1);
        expect(() => parse(schema1, "test")).toThrowError();
        expect(() => parse(schema1, 123)).toThrowError();
        expect(() => parse(schema1, {})).toThrowError();
        expect(() => parse(schema1, new Map())).toThrowError();
    });

    test("should exclude non-existing keys", () => {
        const schema$ = schema(z => z.object({
            key: z.string.optional(),
        }));
        const output1 = parse(schema$, {key: undefined});
        expect("key" in output1).toBe(true);
        const output2 = parse(schema$, {});
        expect("key" in output2).toBe(false);
    });

    test("should throw custom error", () => {
        const error = "Value is not an object!";
        const schema$ = schema(z => z.object({}, error));
        expect(() => parse(schema$, 123)).toThrowError(error);
    });

    test("with partial", () => {
        const schema$ = schema(z => z.partial(
            z.object({
                foo: z.string,
                bar: z.string,
            }),
        ));

        expect(parse(schema$, {})).toEqual({});
        expect(parse(schema$, {foo: "foo"})).toEqual({foo: "foo"});
    });

    test("should throw every issue", () => {
        const schema$ = schema(z => z.object({
            key1: z.string,
            key2: z.string,
        }));
        const input = {
            key1: 1,
            key2: 2,
        };
        expect(() => parse(schema$, input)).toThrowError();
        try {
            parse(schema$, input);
        } catch (error) {
            expect((error as ParseError).issues.length).toBe(2);
        }
    });

    test("should throw only first issue", () => {
        const info = {abortEarly: true};
        const schema$ = schema(z => z.object({
            key1: z.string,
            key2: z.string,
        }));

        const input1 = {
            key1: 1,
            key2: 2,
            key3: 3,
            key4: "4"
        };
        expect(() => parse(schema$, input1, info)).toThrowError();
        try {
            parse(schema$, input1, info);
        } catch (error) {
            expect((error as ParseError).issues.length).toBe(1);
        }
    });

    test("should return issue path", () => {
        const schema1 = schema(z => z.object({
            key: z.number,
        }));
        const input1 = {key: "123"};
        const result1 = schema1._parse(input1);
        expect(result1.issues?.[0].path).toEqual([
            {
                schema: "object",
                input:  input1,
                key:    "key",
                value:  input1.key,
            },
        ]);

        const schema2 = schema(z => z.object({
            nested: z.object({
                key: z.string,
            })
        }));
        const input2 = {nested: {key: 123}};
        const result2 = schema2._parse(input2);
        expect(result2.issues?.[0].path).toEqual([
            {
                schema: "object",
                input:  input2,
                key:    "nested",
                value:  input2.nested,
            },
            {
                schema: "object",
                input:  input2.nested,
                key:    "key",
                value:  input2.nested.key,
            },
        ]);
    });

    test("should execute pipe", () => {
        const input = {
            key1: "1",
            key2: 1
        };
        const transformInput = () => ({
            key1: "2",
            key2: 2,
        });

        const output1 = parse(
            schema((z, p) => z.object({
                key1: z.string,
                key2: z.number,
            }, [
                p.toCustom(transformInput),
            ])),
            input
        );
        const output2 = parse(
            schema((z, p) => z.object({
                key1: z.string,
                key2: z.number
            }, "Error", [
                p.toCustom(transformInput),
            ])),
            input
        );
        expect(output1).toEqual(transformInput());
        expect(output2).toEqual(transformInput());
    });
});
