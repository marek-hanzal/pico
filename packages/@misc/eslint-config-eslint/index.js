import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
	eslint.configs.all,
	...tseslint.configs.strict,
	...tseslint.configs.stylistic,
	{
		rules: {
			"@typescript-eslint/ban-ts-comment": "warn",
			"@typescript-eslint/no-dynamic-delete": "off",
			"@typescript-eslint/no-empty-object-type": "off",
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-namespace": "off",
			"@typescript-eslint/no-non-null-assertion": "off",
			"@typescript-eslint/no-unused-expressions": "off",
			"arrow-body-style": "off",
			"camelcase": "off",
			"capitalized-comments": "off",
			"class-methods-use-this": "off",
			"complexity": "off",
			"consistent-return": "off",
			"default-case": "off",
			"func-style": "off",
			"id-length": "off",
			"max-lines-per-function": "off",
			"max-lines": "off",
			"max-statements": "off",
			"new-cap": "off",
			"no-console": "off",
			"no-continue": "off",
			"no-magic-numbers": "off",
			"no-nested-ternary": "off",
			"no-plusplus": "off",
			"no-return-assign": "off",
			"no-shadow": "off",
			"no-ternary": "off",
			"no-undef-init": "off",
			"no-undefined": "off",
			"no-useless-assignment": "off",
			"no-warning-comments": "off",
			"one-var": "off",
			"require-await": "off",
			"sort-imports": "off",
			"sort-keys": "off",
			"sort-vars": "off",
		},
	},
	{
		rules: {
			"@typescript-eslint/no-unused-vars": "warn",
		},
	},
);
