import { useParams } from "@tanstack/react-router";
import { Icon, LinkTo, More } from "@use-pico/client";
import { toHumanNumber, type IdentitySchema } from "@use-pico/common";
import type { FC } from "react";
import { RequirementsInlineCss } from "~/app/derivean/root/resource/RequirementsInlineCss";

export namespace RequirementsInline {
	interface Data extends IdentitySchema.Type {
		name: string;
		resourceId: string;
		passive: boolean;
		amount: number;
	}

	interface Diff extends IdentitySchema.Type {
		resourceId: string;
		amount: number;
	}

	export interface Props
		extends RequirementsInlineCss.Props<More.PropsEx<Data>> {
		requirements: Data[];
		diff?: Diff[];
	}
}

export const RequirementsInline: FC<RequirementsInline.Props> = ({
	requirements,
	diff,
	variant,
	tva = RequirementsInlineCss,
	css,
	...props
}) => {
	const { locale } = useParams({ from: "/$locale" });
	const tv = tva({ ...variant, css }).slots;

	return (
		<More
			items={requirements}
			render={({ entity }) => {
				const resource = diff?.find((r) => r.resourceId === entity.resourceId);
				const amount =
					resource?.amount ? resource.amount - entity.amount : -entity.amount;

				return (
					<div
						className={tv.item({
							css:
								amount >= 0 ?
									[]
								:	["text-red-700", "bg-red-100", "border-red-300"],
							passive: entity.passive,
						})}
					>
						<LinkTo
							to={
								"/$locale/apps/derivean/game/building/production/resource/list"
							}
							params={{ locale }}
							search={{ filter: { resourceId: entity.resourceId } }}
						>
							{entity.name}
						</LinkTo>
						<div></div>
						<div className={"text-md font-bold text-slate-500"}>
							x{toHumanNumber({ number: entity.amount })}
						</div>
						{diff ?
							amount >= 0 ?
								<Icon
									icon={"icon-[pajamas--check-sm]"}
									css={{
										base: ["text-emerald-600"],
									}}
								/>
							:	<div
									className={
										"flex flex-row gao-2 items-center text-sm text-red-500"
									}
								>
									<Icon
										icon={"icon-[charm--cross]"}
										css={{
											base: ["text-red-500"],
										}}
									/>
									({toHumanNumber({ number: amount })})
								</div>

						:	null}
					</div>
				);
			}}
			{...props}
		/>
	);
};
