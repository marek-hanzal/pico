import { Tx } from "@use-pico/client";
import { tvc } from "@use-pico/common";
import type { FC } from "react";
import { Panel } from "~/app/derivean/game/GameMap2/Panel";
import { Item } from "~/app/derivean/game/GameMap2/Production/Requirement/Item";
import { ResourceIcon } from "~/app/derivean/icon/ResourceIcon";

export namespace RequirementPanel {
	export interface Blueprint {
		id: string;
		name: string;
	}

	export interface Requirement {
		id: string;
		name: string;
		amount: number;
		passive: boolean;
	}

	export interface Props extends Panel.PropsEx {
		blueprint: Blueprint;
		requirement: Requirement[];
	}
}

export const RequirementPanel: FC<RequirementPanel.Props> = ({
	blueprint,
	requirement,
	...props
}) => {
	return (
		<Panel
			icon={ResourceIcon}
			textTitle={<Tx label={"Building requirements (label)"} />}
			textSubTitle={blueprint.name}
			{...props}
		>
			{requirement.length > 0 ?
				requirement.map((item) => {
					return (
						<Item
							key={item.id}
							requirement={item}
						/>
					);
				})
			:	<div
					className={tvc([
						"flex",
						"items-center",
						"justify-center",
						"rounded-sm",
						"border",
						"border-green-400",
						"p-4",
						"bg-green-200",
						"font-bold",
					])}
				>
					<Tx label={"There are no requirements. (label)"} />
				</div>
			}

			<div className={"border-b border-slate-300"} />

			<div
				className={tvc([
					"w-full",
					"h-96",
					"bg-contain",
					"p-2",
					`bg-${blueprint.id}`,
				])}
			/>
		</Panel>
	);
};
