import { useParams } from "@tanstack/react-router";
import { LinkTo, Tx } from "@use-pico/client";
import { tvc } from "@use-pico/common";
import type { FC } from "react";
import { Item } from "~/app/derivean/game/GameMap2/Construction/Item";
import { Panel } from "~/app/derivean/game/GameMap2/Panel";
import { ConstructionIcon } from "~/app/derivean/icon/ConstructionIcon";

export namespace ConstructionPanel {
	export interface Blueprint {
		id: string;
		name: string;
		count: number;
		cycles: number;
	}

	export interface Land {
		id: string;
		name: string;
	}

	export interface Props extends Panel.PropsEx {
		userId: string;
		land: Land;
		blueprints: Blueprint[];
	}
}

export const ConstructionPanel: FC<ConstructionPanel.Props> = ({
	userId,
	land,
	blueprints,
	...props
}) => {
	const { locale, mapId } = useParams({
		from: "/$locale/apps/derivean/map/$mapId",
	});

	return (
		<Panel
			icon={ConstructionIcon}
			textTitle={
				<LinkTo
					to={"/$locale/apps/derivean/map/$mapId/land/$landId/construction"}
					params={{ locale, mapId, landId: land.id }}
					search={{ zoomToId: land.id }}
				>
					{land.name}
				</LinkTo>
			}
			textSubTitle={<Tx label={"Construction (label)"} />}
			{...props}
		>
			{blueprints.length > 0 ?
				blueprints.map((item) => {
					return (
						<Item
							key={item.id}
							blueprint={item}
							userId={userId}
							land={land}
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
						"border-amber-400",
						"p-4",
						"bg-amber-200",
						"font-bold",
					])}
				>
					<Tx label={"There are no available blueprints (label)"} />
				</div>
			}
		</Panel>
	);
};
