import { css } from "@use-pico/common";

export const LoadingOverlayCss = css({
	slot: {
		base: [
			"fixed",
			"inset-0",
			"h-full",
			"items-center",
			"justify-center",
			"bg-slate-100",
			"flex",
			"transition-all",
			"duration-200",
			"z-10",
			"pointer-events-none",
			"bg-opacity-0",
			"backdrop-blur-none",
		],
	},
	variant: {
		show: {
			true: ["bg-opacity-50", "backdrop-blur-xs", "pointer-events-auto"],
		},
	},
	defaults: {
		show: true,
	},
});

export namespace LoadingOverlayCss {
	export type Props<P = unknown> = css.Props<typeof LoadingOverlayCss, P>;
}
