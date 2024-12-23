import { createFileRoute, redirect } from "@tanstack/react-router";
import { LogoutIcon, ls, Status, Tx } from "@use-pico/client";
import { tvc } from "@use-pico/common";

export const Route = createFileRoute("/$locale/public/logout")({
	pendingComponent() {
		return (
			<div
				className={tvc([
					"flex items-center justify-center h-screen",
					"bg-gradient-to-tr",
					"from-blue-700",
					"to-blue-400",
				])}
			>
				<Status
					icon={LogoutIcon}
					textTitle={<Tx label={"Logout (label)"} />}
					textMessage={<Tx label={"Logout in progress..."} />}
					css={{
						base: ["p-4", "bg-slate-200", "rounded"],
					}}
				/>
			</div>
		);
	},
	async loader({ params: { locale } }) {
		ls.remove("session");

		throw redirect({ to: "/$locale/public", params: { locale } });
	},
});