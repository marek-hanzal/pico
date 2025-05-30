import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "@tanstack/react-router";
import type {
	CursorSchema,
	Entity,
	FilterSchema,
	IdentitySchema,
} from "@use-pico/common";
import { useEffect, useState, type FC } from "react";
import { Button } from "../button/Button";
import type { Fulltext } from "../fulltext/Fulltext";
import { BackIcon } from "../icon/BackIcon";
import { ConfirmIcon } from "../icon/ConfirmIcon";
import { Icon } from "../icon/Icon";
import { LoaderIcon } from "../icon/LoaderIcon";
import { SelectionOff } from "../icon/SelectionOff";
import { SelectionOn } from "../icon/SelectionOn";
import { Modal } from "../modal/Modal";
import type { withListCount } from "../source/withListCount";
import type { Table } from "../table/Table";
import { Tx } from "../tx/Tx";
import { PopupSelectCss } from "./PopupSelectCss";

export namespace PopupSelect {
	export namespace Query {
		export interface Props {
			filter?: Omit<FilterSchema.Type, "idIn">;
			cursor?: CursorSchema.Type;
		}

		export type Callback<TItem extends IdentitySchema.Type> = (
			props: Props,
		) => Promise<withListCount.Result<TItem>>;
	}

	export interface Props<TItem extends IdentitySchema.Type>
		extends PopupSelectCss.Props {
		icon?: string | ReactNode;
		textTitle?: ReactNode;
		textSelect?: ReactNode;
		modalProps?: Modal.PropsEx;
		table: FC<Table.PropsEx<TItem>>;
		render: FC<Entity.Type<TItem>>;
		allowEmpty?: boolean;

		/**
		 * Name used for react-query cache.
		 */
		queryKey: string;
		queryHash?: Record<any, any>;
		query: Query.Callback<TItem>;

		value?: string | null;
		onChange(value: string | null): void;
		/**
		 * Selected (submitted) value/null.
		 */
		onSelect?(item: TItem | null): void;
	}

	export type PropsEx<TItem extends IdentitySchema.Type> = Omit<
		Props<TItem>,
		"table" | "queryKey" | "queryHash" | "query" | "render"
	>;
}

export const PopupSelect = <TItem extends IdentitySchema.Type>({
	icon,
	textTitle,
	textSelect,
	modalProps,
	table: Table,
	render: Render,
	allowEmpty = false,

	queryKey,
	queryHash,
	query,

	value,
	onChange,
	onSelect,

	variant,
	tva = PopupSelectCss,
	css,
}: PopupSelect.Props<TItem>) => {
	const tv = tva({
		...variant,
		css,
	}).slots;

	const [page, setPage] = useState(0);
	const [size, setSize] = useState(15);
	const [selection, setSelection] = useState<string[]>(value ? [value] : []);
	const [fulltext, setFulltext] = useState<Fulltext.Value>("");

	const result = useQuery({
		queryKey: [
			queryKey,
			"PopupSelect",
			"data",
			{ fulltext, page, size, ...queryHash },
		],
		async queryFn() {
			return query({
				filter: {
					fulltext,
				},
				cursor: {
					page,
					size,
				},
			});
		},
	});

	const withValue = Boolean(value);

	const selected = useQuery({
		queryKey: [queryKey, "PopupSelect", "selected", { value, ...queryHash }],
		async queryFn() {
			return query({
				filter: {
					id: value ?? undefined,
				},
			});
		},
		enabled: withValue,
	});

	useEffect(() => {
		setSelection(value ? [value] : []);
	}, [value]);

	return (
		<Modal
			icon={icon}
			target={
				<label
					className={tv.input({
						loading: selected.isLoading,
						selected: Boolean(selected.data?.data.length),
					})}
				>
					<Icon
						icon={
							selected.isLoading ? LoaderIcon
							: withValue && selected.data?.data?.[0] ?
								SelectionOn
							:	SelectionOff
						}
					/>
					{withValue && selected.data?.data?.[0] ?
						<Render entity={selected.data?.data?.[0]} />
					:	textSelect || <Tx label={"Select item (label)"} />}
				</label>
			}
			textTitle={textTitle}
			variant={{
				loading: result.isLoading,
			}}
			disabled={result.isLoading}
			css={{
				modal: ["w-2/3"],
			}}
			{...modalProps}
		>
			{({ close }) => {
				return (
					<div className={tv.base()}>
						<div className={tv.content()}>
							<Table
								cursor={{
									cursor: {
										page,
										size,
									},
									count:
										result.data?.count ?
											result.data.count
										:	{
												filter: -1,
												total: -1,
												where: -1,
											},
									textTotal: <Tx label={"Total count of items (label)"} />,
									onPage(page) {
										setPage(page);
									},
									onSize(size) {
										setSize(size);
										setPage(0);
									},
								}}
								fulltext={{
									value: fulltext,
									set(value) {
										setFulltext(value);
										setPage(0);
									},
								}}
								table={{
									data: result.data?.data ?? [],
									selection: {
										type: "single",
										value: selection,
										set(selection) {
											setSelection(selection);
										},
									},
								}}
							/>
						</div>

						<div className={tv.footer()}>
							<Button
								iconEnabled={BackIcon}
								iconDisabled={BackIcon}
								onClick={() => {
									close();
									setSelection(value ? [value] : []);
								}}
								variant={{
									variant: "subtle",
								}}
							>
								<Tx label={"Close (label)"} />
							</Button>

							<Button
								iconEnabled={ConfirmIcon}
								iconDisabled={ConfirmIcon}
								disabled={!selection.length && !allowEmpty}
								onClick={() => {
									onChange(selection?.[0] || null);
									onSelect?.(
										result.data?.data?.find(
											(item) => item.id === selection?.[0],
										) ?? null,
									);
									close();
								}}
							>
								<Tx label={"Confirm selection (label)"} />
							</Button>
						</div>
					</div>
				);
			}}
		</Modal>
	);
};
