import { useParams } from "@tanstack/react-router";
import {
    ActionMenu,
    ActionModal,
    LinkTo,
    Table,
    Tx,
    useTable,
    withColumn,
} from "@use-pico/client";
import { toHumanNumber, type withRepositorySchema } from "@use-pico/common";
import type { FC } from "react";
import { SlotIcon } from "~/app/derivean/icon/SlotIcon";
import { KindInline } from "~/app/derivean/item/KindInline";
import type { SlotSchema } from "~/app/derivean/slot/SlotSchema";

const column = withColumn<withRepositorySchema.Entity<SlotSchema>>();

const columns = [
	column({
		name: "name",
		header() {
			return <Tx label={"Slot name (label)"} />;
		},
		render({ data, value }) {
			const { locale } = useParams({ from: "/$locale" });

			return (
				<LinkTo
					to={"/$locale/apps/derivean/root/slot/$id/view"}
					params={{ locale, id: data.id }}
				>
					{value}
				</LinkTo>
			);
		},
		size: 16,
	}),
	column({
		name: "kind",
		header() {
			return <Tx label={"Item kind (label)"} />;
		},
		render({ value }) {
			return <KindInline kind={value} />;
		},
		filter: {
			path: "kind",
			onFilter({ data, filter }) {
				filter.shallow("kind", data.kind);
			},
		},
		size: 18,
	}),
	column({
		name: "size",
		header() {
			return <Tx label={"Slot size (label)"} />;
		},
		render({ value }) {
			return toHumanNumber({ number: value });
		},
		size: 10,
	}),
];

export namespace SlotTable {
	export interface Props
		extends Table.PropsEx<withRepositorySchema.Entity<SlotSchema>> {
		inventoryId?: string;
	}
}

export const SlotTable: FC<SlotTable.Props> = ({
	inventoryId,
	table,
	...props
}) => {
	return (
		<Table
			table={useTable({
				...table,
				columns,
			})}
			action={{
				table() {
					return (
						<ActionMenu>
							<ActionModal
								label={<Tx label={"Create slot (menu)"} />}
								textTitle={<Tx label={"Create slot (modal)"} />}
								icon={SlotIcon}
							>
								{/* <SlotForm
									mutation={SlotQuery.useCreateMutation({
										async toCreate(create) {
											return {
												shape: create,
												link: {},
											};
										},
									})}
									onSuccess={async () => {
										//
									}}
								/> */}
							</ActionModal>
						</ActionMenu>
					);
				},
				row({ data }) {
					return (
						<ActionMenu>
							<ActionModal
								label={<Tx label={"Edit slot (menu)"} />}
								textTitle={<Tx label={"Edit slot (modal)"} />}
								icon={SlotIcon}
							>
								{/* <SlotForm
									defaultValues={data}
									mutation={SlotQuery.usePatchMutation({
										async toPatch(shape) {
											return {
												shape,
												link: {
													inventory: inventoryId,
												},
												filter: {
													id: data.id,
												},
											};
										},
									})}
									onSuccess={async () => {
										//
									}}
								/> */}
							</ActionModal>
						</ActionMenu>
					);
				},
			}}
			{...props}
		/>
	);
};