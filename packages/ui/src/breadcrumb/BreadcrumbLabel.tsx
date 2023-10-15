import {Translation} from "@use-pico/i18n";
import {type FC}     from "react";
import {Breadcrumb}  from "../api/Breadcrumb";
import {Group}       from "../ui/Group";
import {WithIcon}    from "../ui/WithIcon";

export namespace BreadcrumbLabel {
    export type Props = Breadcrumb.Label;
}

export const BreadcrumbLabel: FC<BreadcrumbLabel.Props> = (
    {
        label,
        icon,
    }) => {
    return <Group gap={"sm"}>
        <WithIcon icon={icon}/>
        <Translation withLabel={label}/>
    </Group>;
};
