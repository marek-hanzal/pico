import {
    describe,
    expect,
    test
} from "vitest";
import {
    maxLength,
    minLength,
    parse,
    withString
} from "../src";

describe("withString", () => {
    test("should pass only strings", () => {
        const schema = withString();
        const input = "";
        const output = parse(schema, input);
        expect(output).toBe(input);
        expect(() => parse(schema, 123n)).toThrowError();
        expect(() => parse(schema, null)).toThrowError();
        expect(() => parse(schema, {})).toThrowError();
    });

    test("with nullish", () => {
        const schema = withString().nonEmpty().nullish();
        const input = "good";
        expect(parse(schema, input)).toBe(input);
        expect(parse(schema, undefined)).toBeUndefined();
        expect(parse(schema, null)).toBeNull();
        expect(() => parse(schema, "")).toThrowError();
    });

    test("with optional", () => {
        const schema = withString().nonEmpty().optional();
        const input = "good";
        expect(parse(schema, input)).toBe(input);
        expect(parse(schema, undefined)).toBeUndefined();
        expect(() => parse(schema, "")).toThrowError();
        expect(() => parse(schema, null)).toThrowError();
    });

    test("should throw custom error", () => {
        const error = "Value is not a string!";
        expect(() => parse(withString(error), 123)).toThrowError(error);
    });

    test("should execute pipe", () => {
        const schema1 = withString([minLength(1), maxLength(3)]);
        const input1 = "12";
        const output1 = parse(schema1, input1);
        expect(output1).toBe(input1);
        expect(() => parse(schema1, "")).toThrowError("Minimum length rule violation");
        expect(() => parse(schema1, "1234")).toThrowError("Maximum length rule violation");
    });

    test("non empty string", () => {
        const schema1 = withString().nonEmpty();
        const input1 = "12";
        const output1 = parse(schema1, input1);
        expect(output1).toBe(input1);
        expect(() => parse(schema1, "")).toThrowError("Non empty rule violation");
        expect(() => parse(schema1, "  ")).toThrowError("Non empty rule violation");
    });
});
