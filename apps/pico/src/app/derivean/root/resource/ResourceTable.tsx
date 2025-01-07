import { useParams } from "@tanstack/react-router";
import {
    ActionMenu,
    ActionModal,
    DeleteControl,
    LinkTo,
    Table,
    Tags,
    toast,
    TrashIcon,
    Tx,
    useCreateMutation,
    usePatchMutation,
    useSourceInvalidator,
    useTable,
    withColumn,
    withToastPromiseTx,
} from "@use-pico/client";
import type { FC } from "react";
import { ResourceIcon } from "~/app/derivean/icon/ResourceIcon";
import type { ResourceSchema } from "~/app/derivean/resource/ResourceSchema";
import { ResourceSource } from "~/app/derivean/resource/ResourceSource";
import { ResourceTagSource } from "~/app/derivean/resource/tag/ResourceTagSource";
import { ResourceForm } from "~/app/derivean/root/resource/ResourceForm";

const column = withColumn<ResourceSchema["~output"]>();

const columns = [
	column({
		name: "name",
		header() {
			return <Tx label={"Resource name (label)"} />;
		},
		render({ data, value }) {
			const { locale } = useParams({ from: "/$locale" });

			return (
				<LinkTo
					to={"/$locale/apps/derivean/root/resource/$id/view"}
					params={{ locale, id: data.id }}
				>
					{value}
				</LinkTo>
			);
		},
		size: 18,
	}),
	column({
		name: "tags",
		header() {
			return <Tx label={"Resource tags (label)"} />;
		},
		render({ value }) {
			return <Tags tags={value} />;
		},
		size: 32,
	}),
];

export namespace ResourceTable {
	export interface Props extends Table.PropsEx<ResourceSchema["~output"]> {
		group?: string;
	}
}

export const ResourceTable: FC<ResourceTable.Props> = ({
	group,
	table,
	...props
}) => {
	const invalidator = useSourceInvalidator({
		sources: [ResourceSource, ResourceTagSource],
	});

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
								label={<Tx label={"Create resource (menu)"} />}
								textTitle={<Tx label={"Create resource (modal)"} />}
								icon={ResourceIcon}
							>
								<ResourceForm
									group={group}
									mutation={useCreateMutation({
										source: ResourceSource,
										async wrap(callback) {
											return toast.promise(
												callback(),
												withToastPromiseTx("Create resource"),
											);
										},
									})}
									onSuccess={async ({ modalContext }) => {
										await invalidator();
										modalContext?.close();
									}}
								/>
							</ActionModal>
						</ActionMenu>
					);
				},
				row({ data }) {
					return (
						<ActionMenu>
							<ActionModal
								label={<Tx label={"Edit (menu)"} />}
								textTitle={<Tx label={"Edit resource (modal)"} />}
								icon={ResourceIcon}
							>
								<ResourceForm
									defaultValues={data}
									mutation={usePatchMutation({
										source: ResourceSource,
										async wrap(callback) {
											return toast.promise(
												callback(),
												withToastPromiseTx("Update resource"),
											);
										},
										async toPatch() {
											return {
												filter: {
													id: data.id,
												},
											};
										},
									})}
									onSuccess={async ({ modalContext }) => {
										await invalidator();
										modalContext?.close();
									}}
								/>
							</ActionModal>

							<ActionModal
								icon={TrashIcon}
								label={<Tx label={"Delete (menu)"} />}
								textTitle={<Tx label={"Delete resource (modal)"} />}
								css={{
									base: [
										"text-red-500",
										"hover:text-red-600",
										"hover:bg-red-50",
									],
								}}
							>
								<DeleteControl
									source={ResourceSource}
									textContent={<Tx label={"Resource delete (content)"} />}
									filter={{
										id: data.id,
									}}
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