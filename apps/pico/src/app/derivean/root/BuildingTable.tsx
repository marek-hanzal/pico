import { useMutation } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import {
    ActionMenu,
    ActionModal,
    DeleteControl,
    LinkTo,
    Table,
    toast,
    TrashIcon,
    Tx,
    useInvalidator,
    useTable,
    withColumn,
    withToastPromiseTx,
} from "@use-pico/client";
import { type IdentitySchema } from "@use-pico/common";
import type { FC } from "react";
import { kysely } from "~/app/derivean/db/kysely";
import { BlueprintIcon } from "~/app/derivean/icon/BlueprintIcon";
import { BuildingIcon } from "~/app/derivean/icon/BuildingIcon";
import { BuildingForm } from "~/app/derivean/root/BuildingForm";

export namespace BuildingTable {
	export interface Data extends IdentitySchema.Type {
		name: string;
		blueprintId: string;
	}
}

const column = withColumn<BuildingTable.Data>();

const columns = [
	column({
		name: "name",
		header() {
			return <Tx label={"Building name (label)"} />;
		},
		render({ data, value }) {
			const { locale } = useParams({ from: "/$locale" });

			return (
				<div className={"flex flex-row gap-2"}>
					<LinkTo
						icon={BlueprintIcon}
						to={"/$locale/apps/derivean/root/blueprint/$id/view"}
						params={{ locale, id: data.blueprintId }}
					/>

					{value}
				</div>
			);
		},
		size: 14,
	}),
];

export namespace BuildingTable {
	export interface Props extends Table.PropsEx<Data> {
		//
	}
}

export const BuildingTable: FC<BuildingTable.Props> = ({ table, ...props }) => {
	const invalidator = useInvalidator([["Building"]]);

	return (
		<Table
			table={useTable({
				...table,
				columns,
			})}
			action={{
				row({ data }) {
					return (
						<ActionMenu>
							<ActionModal
								label={<Tx label={"Edit (menu)"} />}
								textTitle={<Tx label={"Edit building (modal)"} />}
								icon={BuildingIcon}
							>
								<BuildingForm
									defaultValues={data}
									mutation={useMutation({
										async mutationFn(values) {
											return toast.promise(
												kysely.transaction().execute((tx) => {
													return tx
														.updateTable("Building")
														.set(values)
														.where("id", "=", data.id)
														.returningAll()
														.executeTakeFirstOrThrow();
												}),
												withToastPromiseTx("Edit building"),
											);
										},
										async onSuccess() {
											await invalidator();
										},
									})}
								/>
							</ActionModal>

							<ActionModal
								icon={TrashIcon}
								label={<Tx label={"Delete (menu)"} />}
								textTitle={<Tx label={"Delete building (modal)"} />}
								css={{
									base: [
										"text-red-500",
										"hover:text-red-600",
										"hover:bg-red-50",
									],
								}}
							>
								<DeleteControl
									callback={async () => {
										return kysely.transaction().execute(async (tx) => {
											return tx
												.deleteFrom("Building")
												.where("id", "=", data.id)
												.execute();
										});
									}}
									textContent={<Tx label={"Building delete (content)"} />}
									textToast={"Building delete"}
									invalidator={invalidator}
								/>
							</ActionModal>
						</ActionMenu>
					);
				},
			}}
			{...props}
		/>
	);
};
