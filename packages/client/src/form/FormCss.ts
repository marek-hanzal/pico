import { css } from "@use-pico/common";

export const FormCss = css({
	slot: {
		base: [
			"border",
			"border-gray-300",
			"rounded-md",
			"p-4",
			"flex",
			"flex-col",
			"gap-2",
			"items-center",
		],
		input: [
			"w-full",
			"border",
			"border-gray-300",
			"rounded-md",
			"p-2",
			"focus:outline-none",
			"focus:ring-2",
			"focus:ring-blue-500",
			"focus:border-transparent",
		],
		submit: [
			"border",
			"border-blue-300",
			"bg-blue-200",
			"hover:bg-blue-300",
			"rounded-md",
			"py-2",
			"px-4",
			"text-blue-800",
			"font-bold",
			"w-fit",
		],
	},
	variant: {
		isLoading: {
			true: [],
		},
		isSubmitting: {
			true: [],
		},
	},
	match: [
		{
			if: {
				isSubmitting: true,
			},
			then: {
				base: ["opacity-50", "pointer-events-none", "select-none"],
			},
		},
	],
	defaults: {
		isLoading: false,
		isSubmitting: false,
	},
});

export namespace FormCss {
	export type Props<P = unknown> = css.Props<typeof FormCss, P>;
}
