import type {
    InsertQueryBuilder,
    SelectQueryBuilder,
    UpdateQueryBuilder,
} from "kysely";
import { z } from "zod";
import type { Database } from "../database/Database";
import type { CountSchema } from "../schema/CountSchema";
import type { CursorSchema } from "../schema/CursorSchema";
import type { FilterSchema } from "../schema/FilterSchema";
import { id } from "../toolbox/id";
import type { withRepositorySchema } from "./withRepositorySchema";

export namespace withRepository {
	export type Apply = "where" | "filter" | "cursor" | "sort";

	export interface Query<
		TSchema extends withRepositorySchema.Instance<any, any, any>,
	> {
		where?: withRepositorySchema.Filter<TSchema>;
		filter?: withRepositorySchema.Filter<TSchema>;
		cursor?: CursorSchema.Type;
	}

	export namespace Props {
		export namespace Meta {
			export interface Instance<
				TSchema extends withRepositorySchema.Instance<any, any, any>,
			> {
				where: Omit<
					Record<keyof withRepositorySchema.Filter<TSchema>, string>,
					keyof FilterSchema.Type
				>;
			}
		}

		export namespace toCreate {
			export interface Props<
				TSchema extends withRepositorySchema.Instance<any, any, any>,
			> {
				shape: withRepositorySchema.Shape<TSchema>;
			}

			export type Callback<
				TSchema extends withRepositorySchema.Instance<any, any, any>,
			> = (
				props: Props<TSchema>,
			) => Promise<Omit<withRepositorySchema.Entity<TSchema>, "id">>;
		}

		export namespace toPatch {
			export interface Props<
				TSchema extends withRepositorySchema.Instance<any, any, any>,
			> {
				shape: withRepositorySchema.Shape<TSchema>;
			}

			export type Callback<
				TSchema extends withRepositorySchema.Instance<any, any, any>,
			> = (
				props: Props<TSchema>,
			) => Promise<Partial<Omit<withRepositorySchema.Entity<TSchema>, "id">>>;
		}

		export namespace insert {
			export interface Props {
				//
			}

			export type Callback = (
				props: Props,
			) => InsertQueryBuilder<any, any, any>;
		}

		export namespace update {
			export interface Props {
				//
			}

			export type Callback = (
				props: Props,
			) => UpdateQueryBuilder<any, any, any, any>;
		}

		export namespace select {
			export interface Props<
				TSchema extends withRepositorySchema.Instance<any, any, any>,
			> {
				query: Query<TSchema>;
			}

			export type Callback<
				TSchema extends withRepositorySchema.Instance<any, any, any>,
			> = (props: Props<TSchema>) => SelectQueryBuilder<any, any, any>;
		}

		export namespace applyWhere {
			export interface Props<
				TSchema extends withRepositorySchema.Instance<any, any, any>,
			> {
				where: withRepositorySchema.Filter<TSchema>;
				select: SelectQueryBuilder<any, any, any>;
				apply?: Apply[];
			}

			export type Callback<
				TSchema extends withRepositorySchema.Instance<any, any, any>,
			> = (props: Props<TSchema>) => SelectQueryBuilder<any, any, any>;
		}
	}

	export interface Props<
		TSchema extends withRepositorySchema.Instance<any, any, any>,
	> {
		schema: TSchema;
		database: Database.Instance<any>;
		meta: Props.Meta.Instance<TSchema>;

		toCreate: Props.toCreate.Callback<TSchema>;
		toPatch: Props.toPatch.Callback<TSchema>;

		insert: Props.insert.Callback;
		update: Props.update.Callback;
		select: Props.select.Callback<TSchema>;

		applyWhere?: Props.applyWhere.Callback<TSchema>;
		applyFilter?: Props.applyWhere.Callback<TSchema>;
	}

	export namespace Instance {
		export namespace create {
			export interface Props<
				TSchema extends withRepositorySchema.Instance<any, any, any>,
			> {
				shape: withRepositorySchema.Shape<TSchema>;
			}

			export type Callback<
				TSchema extends withRepositorySchema.Instance<any, any, any>,
			> = (
				props: Props<TSchema>,
			) => Promise<withRepositorySchema.Output<TSchema>>;
		}

		export namespace patch {
			export interface Props<
				TSchema extends withRepositorySchema.Instance<any, any, any>,
			> {
				shape: withRepositorySchema.Shape<TSchema>;
				filter: withRepositorySchema.Filter<TSchema>;
			}

			export type Callback<
				TSchema extends withRepositorySchema.Instance<any, any, any>,
			> = (
				props: Props<TSchema>,
			) => Promise<withRepositorySchema.Output<TSchema>>;
		}

		export namespace fetch {
			export interface Props<
				TSchema extends withRepositorySchema.Instance<any, any, any>,
			> {
				query: Query<TSchema>;
			}

			export type Callback<
				TSchema extends withRepositorySchema.Instance<any, any, any>,
			> = (
				props: Props<TSchema>,
			) => Promise<withRepositorySchema.Output<TSchema> | undefined>;
		}

		export namespace list {
			export interface Props<
				TSchema extends withRepositorySchema.Instance<any, any, any>,
			> {
				query: Query<TSchema>;
			}

			export type Callback<
				TSchema extends withRepositorySchema.Instance<any, any, any>,
			> = (
				props: Props<TSchema>,
			) => Promise<withRepositorySchema.Output<TSchema>[]>;
		}

		export namespace count {
			export interface Props<
				TSchema extends withRepositorySchema.Instance<any, any, any>,
			> {
				query: Omit<Query<TSchema>, "sort" | "cursor">;
			}

			export type Callback<
				TSchema extends withRepositorySchema.Instance<any, any, any>,
			> = (props: Props<TSchema>) => Promise<CountSchema.Type>;
		}

		export namespace applyQuery {
			export interface Props<
				TSchema extends withRepositorySchema.Instance<any, any, any>,
			> {
				query: Query<TSchema>;
				select: SelectQueryBuilder<any, any, any>;
				apply?: Apply[];
			}

			export type Callback<
				TSchema extends withRepositorySchema.Instance<any, any, any>,
			> = (props: Props<TSchema>) => SelectQueryBuilder<any, any, any>;
		}
	}

	export interface Instance<
		TSchema extends withRepositorySchema.Instance<any, any, any>,
	> {
		schema: TSchema;

		create: Instance.create.Callback<TSchema>;
		patch: Instance.patch.Callback<TSchema>;
		fetch: Instance.fetch.Callback<TSchema>;
		list: Instance.list.Callback<TSchema>;
		count: Instance.count.Callback<TSchema>;
	}
}

export const withRepository = <
	TSchema extends withRepositorySchema.Instance<any, any, any>,
>({
	schema,
	database,
	meta,
	toCreate,
	toPatch,
	insert,
	update,
	select,
	applyWhere = ({ select }) => select,
	applyFilter = ({ select }) => select,
}: withRepository.Props<TSchema>): withRepository.Instance<TSchema> => {
	const $applyCommonWhere: withRepository.Props.applyWhere.Callback<
		TSchema
	> = ({ where, select }) => {
		let $select = select;

		for (const [value, field] of Object.entries(meta.where)) {
			if (where?.[value] === undefined) {
				continue;
			}

			/**
			 * Weak type, I know. It's better for now than making some huge type gymnastics as
			 * it's on the repository side to provide right meta.
			 */
			$select =
				where?.[value] === null ?
					$select.where(field as any, "is", null)
				:	$select.where(field as any, "=", where[value]);
		}

		return $select;
	};

	const $applyWhere: withRepository.Props.applyWhere.Callback<TSchema> = ({
		where,
		select,
		apply = ["where", "filter", "cursor", "sort"],
	}) => {
		if (!apply.includes("where")) {
			return select;
		}

		return applyWhere({
			where,
			select: $applyCommonWhere({
				select,
				where,
				apply,
			}),
			apply,
		});
	};

	const $applyFilter: withRepository.Props.applyWhere.Callback<TSchema> = ({
		where,
		select,
		apply = ["where", "filter", "cursor", "sort"],
	}) => {
		if (!apply.includes("filter")) {
			return select;
		}

		return applyFilter({
			where,
			select: $applyCommonWhere({
				select,
				where,
				apply,
			}),
			apply,
		});
	};

	const $applyQuery: withRepository.Instance.applyQuery.Callback<TSchema> = ({
		query,
		select,
		apply = ["where", "filter", "cursor", "sort"],
	}) => {
		return $applyFilter({
			where: query.filter,
			select: $applyWhere({
				select,
				where: query.where,
				apply,
			}),
			apply,
		});
	};

	const instance: withRepository.Instance<TSchema> = {
		schema,
		async create({ shape }) {
			const $id = id();

			await database.run(
				insert({}).values({
					...(await toCreate({ shape })),
					id: $id,
				}),
			);

			return instance.fetch({
				query: {
					where: {
						id: $id,
					},
				},
			});
		},
		async patch({ shape, filter }) {
			const entity = await instance.fetch({ query: { where: filter } });

			if (!entity) {
				throw new Error("Cannot patch an unknown entity (empty query result).");
			}

			await database.run(
				update({})
					.set(await toPatch({ shape }))
					.where("id", "=", entity.id),
			);

			return instance.fetch({ query: { where: { id: entity.id } } });
		},
		async fetch({ query }) {
			return schema.entity.parse(
				(
					await database.run(
						$applyQuery({ query, select: select({ query }).selectAll() }),
					)
				)?.[0],
			);
		},
		async list({ query }) {
			return z
				.array(schema.entity)
				.parse(
					await database.run(
						$applyQuery({ query, select: select({ query }).selectAll() }),
					),
				);
		},
		async count({ query }) {
			return {
				total: (
					await database.run(
						$applyQuery({
							query: {},
							select: select({ query }).select([
								(col) => col.fn.countAll().as("count"),
							]),
							apply: [],
						}),
					)
				).count,
				where: (
					await database.run(
						$applyQuery({
							query: {
								where: query.where,
							},
							select: select({ query }).select([
								(col) => col.fn.countAll().as("count"),
							]),
							apply: ["where"],
						}),
					)
				).count,
				filter: (
					await database.run(
						$applyQuery({
							query: {
								where: query.where,
								filter: query.filter,
							},
							select: select({ query }).select([
								(col) => col.fn.countAll().as("count"),
							]),
							apply: ["filter", "where"],
						}),
					)
				).count,
			} satisfies CountSchema.Type;
		},
	};

	return instance;
};
