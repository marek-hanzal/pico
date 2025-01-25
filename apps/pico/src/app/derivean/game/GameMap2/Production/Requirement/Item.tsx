import { Badge } from "@use-pico/client";
import { toHumanNumber, tvc } from "@use-pico/common";
import type { FC } from "react";
import type { RequirementPanel } from "~/app/derivean/game/GameMap2/Production/Requirement/RequirementPanel";

export namespace Item {
	export interface Props {
		requirement: RequirementPanel.Requirement;
	}
}

export const Item: FC<Item.Props> = ({ requirement }) => {
	const available = (requirement.available || 0) >= requirement.amount;

	return (
		<div
			className={tvc([
				"flex",
				"flex-row",
				"gap-2",
				"items-center",
				"justify-between",
				"border",
				"p-4",
				"rounded-sm",
				"border-slate-200",
				"hover:border-slate-300",
				"hover:bg-slate-100",
				requirement.passive ?
					[
						"border-purple-300",
						"hover:border-purple-500",
						"hover:bg-purple-100",
					]
				:	undefined,
				requirement.available === undefined || available ?
					undefined
				:	[
						"border-red-500",
						"bg-red-50",
						"hover:bg-red-50",
						"hover:border-red-600",
					],
			])}
		>
			<div className={"font-bold"}>{requirement.name}</div>
			{requirement.available === undefined ?
				<Badge>x{toHumanNumber({ number: requirement.amount })}</Badge>
			:	<Badge
					css={{
						base:
							available ?
								["bg-green-200", "border-green-500"]
							:	["bg-red-200", "border-red-500"],
					}}
				>
					<div className={"font-bold"}>
						{toHumanNumber({ number: requirement.available })}
					</div>
					<div>/</div>
					<div className={"font-light"}>
						{toHumanNumber({ number: requirement.amount })}
					</div>
				</Badge>
			}
		</div>
	);
};
