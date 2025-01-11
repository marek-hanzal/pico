import { useParams } from "@tanstack/react-router";
import { Menu, MenuLink, Tx } from "@use-pico/client";
import type { Entity, IdentitySchema } from "@use-pico/common";
import type { FC } from "react";
import { ResourceIcon } from "~/app/derivean/icon/ResourceIcon";

export namespace Resource_Index_Menu {
	export interface Props extends Menu.Props, Entity.Schema<IdentitySchema> {
		//
	}
}

export const Resource_Index_Menu: FC<Resource_Index_Menu.Props> = ({
	entity,
	...props
}) => {
	const { locale } = useParams({ from: "/$locale" });

	return (
		<Menu {...props}>
			<MenuLink
				icon={ResourceIcon}
				to={"/$locale/apps/derivean/root/resource/$id/view"}
				params={{ locale, id: entity.id }}
			>
				<Tx label={"View detail (menu)"} />
			</MenuLink>
		</Menu>
	);
};