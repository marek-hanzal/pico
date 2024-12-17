import { css } from "@use-pico/common";

export const TableCss = css({
	slot: {
		base: ["min-w-full", "flex", "flex-col", "gap-2", "text-sm"],
		table: ["min-w-full", "w-max", "table-fixed"],
		thead: ["border", "border-slate-200", "bg-slate-100"],
		th: ["text-left", "px-2", "py-1", "border-t", "border-b", "border-slate-300"],
		tbody: [],
		tr: ["border-b", "border-b-slate-200", "odd:bg-slate-50", "hover:bg-purple-100", "hover:border-purple-300"],
		td: ["px-2", "py-1"],
		tfoot: [],
	},
	variant: {},
	defaults: {},
});

export namespace TableCss {
	export type Props<P = unknown> = css.Props<typeof TableCss, P>;
}
