import {isHrefProps}     from "@use-pico/navigation";
import {cx}              from "@use-pico/utils";
import {type FC}         from "react";
import {type IMenuItems} from "../api/IMenuItems";
import {Group}           from "../ui/Group";
import classes           from "./Menu.module.css";
import {MenuLink}        from "./MenuLink";

export namespace Menu {
    export interface Props {
        items: IMenuItems;
        active?: string[];
    }

    export type PropsEx = Omit<Props, "items">;

    export type Classes = typeof classes;
}

export const Menu: FC<Menu.Props> = (
    {
        items,
        active,
    }) => {
    return <Group
        h={"100%"}
        mb={"sm"}
        gap={0}
    >
        {items.map((item, index) => {
            if (isHrefProps(item)) {
                return <MenuLink
                    key={`menu-${index}-${item.href}`}
                    className={cx(
                        classes.Link,
                        classes.LinkActive ? {
                            [classes.LinkActive]: active?.includes(item.href),
                        } : undefined
                    )}
                    {...item}
                />;
            }
            return null;
        })}
    </Group>;
};
