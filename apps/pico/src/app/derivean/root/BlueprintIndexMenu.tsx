import { useParams } from "@tanstack/react-router";
import { EditIcon, Menu, MenuLink, Tx } from "@use-pico/client";
import type { Entity, IdentitySchema } from "@use-pico/common";
import type { FC } from "react";
import { BlueprintIcon } from "~/app/derivean/icon/BlueprintIcon";
import { BuildingIcon } from "~/app/derivean/icon/BuildingIcon";
import { InventoryIcon } from "~/app/derivean/icon/InventoryIcon";
import { ProductionIcon } from "~/app/derivean/icon/ProductionIcon";
import { ResourceIcon } from "~/app/derivean/icon/ResourceIcon";

export namespace BlueprintIndexMenu {
	export interface Props extends Menu.Props, Entity.Schema<IdentitySchema> {
		//
	}
}

export const BlueprintIndexMenu: FC<BlueprintIndexMenu.Props> = ({
	entity,
	...props
}) => {
	const { locale } = useParams({ from: "/$locale" });

	return (
		<Menu {...props}>
			<MenuLink
				icon={BlueprintIcon}
				to={"/$locale/apps/derivean/root/blueprint/$id/view"}
				params={{ locale, id: entity.id }}
			>
				<Tx label={"View detail (menu)"} />
			</MenuLink>

			<MenuLink
				icon={BuildingIcon}
				to={"/$locale/apps/derivean/root/blueprint/$id/dependencies"}
				params={{ locale, id: entity.id }}
			>
				<Tx label={"Blueprint dependencies (menu)"} />
			</MenuLink>

			<MenuLink
				icon={ResourceIcon}
				to={"/$locale/apps/derivean/root/blueprint/$id/requirements"}
				params={{ locale, id: entity.id }}
			>
				<Tx label={"Required resources (menu)"} />
			</MenuLink>

			<MenuLink
				icon={ProductionIcon}
				to={"/$locale/apps/derivean/root/blueprint/$id/production"}
				params={{ locale, id: entity.id }}
			>
				<Tx label={"Resource production (menu)"} />
			</MenuLink>

			<MenuLink
				icon={InventoryIcon}
				to={"/$locale/apps/derivean/root/blueprint/$id/inventory"}
				params={{ locale, id: entity.id }}
			>
				<Tx label={"Blueprint inventory (menu)"} />
			</MenuLink>

			<MenuLink
				icon={"icon-[solar--bomb-minimalistic-outline]"}
				to={"/$locale/apps/derivean/root/blueprint/$id/conflicts"}
				params={{ locale, id: entity.id }}
			>
				<Tx label={"Blueprint conflicts (menu)"} />
			</MenuLink>

			<MenuLink
				icon={EditIcon}
				to={"/$locale/apps/derivean/root/blueprint/$id/edit"}
				params={{ locale, id: entity.id }}
			>
				<Tx label={"Edit (menu)"} />
			</MenuLink>
		</Menu>
	);
};
