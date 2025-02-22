import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
    createFileRoute,
    useNavigate,
    useParams,
    useRouteContext,
} from "@tanstack/react-router";
import {
    Button,
    FormCss,
    FormError,
    FormInput,
    LinkTo,
    onSubmit,
    TrashIcon,
    Tx,
    useInvalidator,
    withList,
    type Form,
} from "@use-pico/client";
import { genId, tvc } from "@use-pico/common";
import { dir } from "opfs-tools";
import type { FC } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { kysely } from "~/app/derivean/db/kysely";
import { ArrowRightIcon } from "~/app/derivean/icon/ArrowRightIcon";
import { MapIcon } from "~/app/derivean/icon/MapIcon";
import { MapSchema } from "~/app/derivean/schema/MapSchema";

namespace MapForm {
	export interface Props extends Form.Props<MapSchema["shape"]> {
		//
	}
}

const MapForm: FC<MapForm.Props> = ({
	mutation,
	defaultValues,
	variant,
	tva = FormCss,
	css,
}) => {
	const form = useForm<MapSchema["~shape"]>({
		resolver: zodResolver(MapSchema.shape),
		defaultValues: {
			name: "",
			...defaultValues,
		},
	});

	const tv = tva({
		...variant,
		isLoading: form.formState.isLoading,
		isSubmitting: form.formState.isSubmitting,
		css,
	}).slots;

	return (
		<form
			className={tv.base()}
			onSubmit={onSubmit({
				form,
				mutation,
			})}
		>
			<FormError
				variant={{ highlight: true }}
				error={form.formState.errors.root}
			/>

			<FormInput
				formState={form.formState}
				name={"name"}
				label={<Tx label={"Map name (label)"} />}
				required
			>
				<input
					type={"text"}
					className={tv.input()}
					{...form.register("name")}
				/>
			</FormInput>

			<div className={"flex flex-row justify-between gap-8"}>
				<Button
					iconEnabled={MapIcon}
					type={"submit"}
				>
					<Tx label={"Create map (submit)"} />
				</Button>
			</div>
		</form>
	);
};

export const Route = createFileRoute("/$locale/apps/derivean/game/")({
	async loader({ context: { queryClient, kysely, session } }) {
		const user = await session();

		return {
			user,
			map: await queryClient.ensureQueryData({
				queryKey: ["GameMap", "map", user.id],
				async queryFn() {
					return kysely.transaction().execute((tx) => {
						return withList({
							select: tx
								.selectFrom("Map as m")
								.select(["m.id", "m.name"])
								.where("m.userId", "=", user.id),
							output: z.object({
								id: z.string().min(1),
								name: z.string().min(1),
							}),
						});
					});
				},
			}),
		};
	},
	component() {
		const { user, map } = Route.useLoaderData();
		const { tva } = useRouteContext({ from: "__root__" });
		const tv = tva().slots;
		const invalidator = useInvalidator([["GameMap"]]);
		const { locale } = useParams({ from: "/$locale" });
		const navigate = useNavigate();

		const deleteMapMutation = useMutation({
			async mutationFn({ id }: { id: string }) {
				return kysely.transaction().execute(async (tx) => {
					return Promise.all([
						tx
							.deleteFrom("Map")
							.where("id", "=", id)
							.where("userId", "=", user.id)
							.execute(),
						dir(`/chunk/${id}`).remove(),
					]);
				});
			},
			async onSuccess() {
				await invalidator();
			},
		});

		return (
			<div
				className={tv.base({
					css: ["w-1/2", "mx-auto", "mt-24", "flex", "flex-col", "gap-6"],
				})}
			>
				<div className={"font-bold text-lg border-b border-slate-300"}>
					<Tx label={"Map list (label)"} />
				</div>
				{map.length > 0 ?
					map.map((map) => {
						return (
							<div
								key={map.id}
								className={tvc([
									"flex",
									"flex-row",
									"gap-2",
									"items-center",
									"justify-between",
									"p-4",
									"border",
									"rounded-sm",
									"border-slate-200",
									"hover:border-slate-300",
									"hover:bg-slate-100",
								])}
							>
								<LinkTo
									icon={ArrowRightIcon}
									to={"/$locale/apps/derivean/map/$mapId/view"}
									params={{ locale, mapId: map.id }}
								>
									{map.name}
								</LinkTo>

								<div>
									<Button
										iconEnabled={TrashIcon}
										variant={{ variant: "danger" }}
										loading={deleteMapMutation.isPending}
										onClick={() => {
											deleteMapMutation.mutate({ id: map.id });
										}}
									/>
								</div>
							</div>
						);
					})
				:	<div
						className={tvc([
							"flex",
							"items-center",
							"justify-center",
							"rounded-sm",
							"border",
							"border-amber-400",
							"p-4",
							"bg-amber-200",
							"font-bold",
						])}
					>
						<Tx label={"There are no maps (label)"} />
					</div>
				}

				<div className={"font-bold text-lg border-b border-slate-300"}>
					<Tx label={"New map (label)"} />
				</div>
				<div>
					<MapForm
						mutation={useMutation({
							async mutationFn(values) {
								return kysely.transaction().execute((tx) => {
									return tx
										.insertInto("Map")
										.values({
											id: genId(),
											userId: user.id,
											...values,
										})
										.returning("id")
										.executeTakeFirstOrThrow();
								});
							},
							async onSuccess(map) {
								navigate({
									to: "/$locale/apps/derivean/map/$mapId/view",
									params: { locale, mapId: map.id },
								});
								await invalidator();
							},
						})}
					/>
				</div>
			</div>
		);
	},
});
