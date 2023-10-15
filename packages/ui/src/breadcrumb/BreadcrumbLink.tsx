import {ActionIcon} from "@mantine/core";
import {LocaleLink} from "@use-pico/i18n";
import {type FC}    from "react";
import {Breadcrumb} from "../api/Breadcrumb";
import {ButtonLink} from "../ui/ButtonLink";

export namespace BreadcrumbLink {
    export interface Props extends Breadcrumb.Link {
    }
}

export const BreadcrumbLink: FC<BreadcrumbLink.Props> = (
    {
        href,
        icon,
        label,
        buttonProps,
        actionIconProps,
    }
) => {
    return label ? <ButtonLink
        href={href}
        icon={icon}
        label={label}
        buttonProps={{
            size:    "lg",
            p:       "xs",
            variant: "subtle",
            ...buttonProps,
        }}
    /> : <LocaleLink
        href={href}
    >
        <ActionIcon
            size={"xl"}
            variant={"subtle"}
            color={"blue.5"}
            {...actionIconProps}
        >
            {icon}
        </ActionIcon>
    </LocaleLink>;
};
