import { useMutation } from "@tanstack/react-query";
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
	useInvalidator,
	useTable,
	withColumn,
	withToastPromiseTx,
} from "@use-pico/client";
import { genId, type IdentitySchema, type TagSchema } from "@use-pico/common";
import type { FC } from "react";
import { kysely } from "~/app/derivean/db/kysely";
import { ResourceIcon } from "~/app/derivean/icon/ResourceIcon";
import { ResourceForm } from "~/app/derivean/root/resource/Resource_Form";

interface Data extends IdentitySchema.Type {
	name: string;
	tags: TagSchema.Type[];
}

const column = withColumn<Data>();

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
	export interface Props extends Table.PropsEx<Data> {
		group?: string;
	}
}

export const ResourceTable: FC<ResourceTable.Props> = ({
	group,
	table,
	...props
}) => {
	const invalidator = useInvalidator([["Resource"]]);

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
									mutation={useMutation({
										async mutationFn({ name, tagIds = [] }) {
											return toast.promise(
												kysely.transaction().execute(async (tx) => {
													const entity = await tx
														.insertInto("Resource")
														.values({
															id: genId(),
															name,
														})
														.returningAll()
														.executeTakeFirstOrThrow();

													if (tagIds.length) {
														await tx
															.insertInto("Resource_Tag")
															.values(
																tagIds.map((tagId) => ({
																	id: genId(),
																	resourceId: entity.id,
																	tagId,
																})),
															)
															.execute();
													}

													return entity;
												}),
												withToastPromiseTx("Create resource"),
											);
										},
										async onSuccess() {
											await invalidator();
										},
									})}
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
									defaultValues={{
										...data,
										tagIds: data.tags.map(({ id }) => id),
									}}
									mutation={useMutation({
										async mutationFn({ tagIds, ...rest }) {
											return toast.promise(
												kysely.transaction().execute(async (tx) => {
													const entity = await tx
														.updateTable("Resource")
														.set(rest)
														.where("id", "=", data.id)
														.returningAll()
														.executeTakeFirstOrThrow();

													await tx
														.deleteFrom("Resource_Tag")
														.where("resourceId", "=", entity.id)
														.execute();

													if (tagIds?.length) {
														await tx
															.insertInto("Resource_Tag")
															.values(
																tagIds.map((tagId) => ({
																	id: genId(),
																	resourceId: entity.id,
																	tagId,
																})),
															)
															.execute();
													}

													return entity;
												}),
												withToastPromiseTx("Update resource"),
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
									callback={async () => {
										return kysely.transaction().execute(async (tx) => {
											return tx
												.deleteFrom("Resource")
												.where("id", "=", data.id)
												.execute();
										});
									}}
									textContent={<Tx label={"Resource delete (content)"} />}
									textToast={"Resource delete"}
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
