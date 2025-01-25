import { useParams } from "@tanstack/react-router";
import { Button, CloseIcon, Icon, LinkTo } from "@use-pico/client";
import type { FC, PropsWithChildren, ReactNode } from "react";
import { PanelCss } from "~/app/derivean/game/GameMap2/PanelCss";

export namespace Panel {
	export interface Props extends PanelCss.Props<PropsWithChildren> {
		icon: string;
		textTitle: ReactNode;
		textSubTitle?: ReactNode;
	}

	export type PropsEx = Omit<Props, "icon" | "textTitle">;
}

export const Panel: FC<Panel.Props> = ({
	icon,
	textTitle,
	textSubTitle,
	variant,
	tva = PanelCss,
	css,
	children,
}) => {
	const { mapId, locale } = useParams({
		from: "/$locale/apps/derivean/map/$mapId",
	});
	const tv = tva({ ...variant, css }).slots;

	return (
		<div className={tv.base()}>
			<div className={tv.title()}>
				<div className={"flex flex-col gap-2 font-bold"}>
					<div className={"flex flex-row gap-2 items-center"}>
						<Icon
							icon={icon}
							css={{ base: ["text-slate-500"] }}
						/>
						{textTitle}
					</div>

					{textSubTitle ?
						<div
							className={
								"flex flex-row gap-2 items-center text-sm text-slate-500"
							}
						>
							{textSubTitle}
						</div>
					:	null}
				</div>
				<LinkTo
					to={"/$locale/apps/derivean/map/$mapId/view"}
					params={{ locale, mapId }}
				>
					<Button
						iconEnabled={CloseIcon}
						variant={{ variant: "subtle" }}
					/>
				</LinkTo>
			</div>
			<div className={tv.content()}>{children}</div>
		</div>
	);
};
