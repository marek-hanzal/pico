import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { ls, Toaster } from "@use-pico/client";
import { SessionSchema } from "~/app/derivean/schema/SessionSchema";

export const Route = createFileRoute("/$locale/apps/derivean/map")({
	async beforeLoad({ context, params: { locale } }) {
		return {
			...context,
			async session() {
				try {
					return SessionSchema.parse(ls.get("session"));
				} catch (_) {
					throw redirect({
						to: `/$locale/apps/derivean/public/login`,
						params: { locale },
					});
				}
			},
		};
	},
	component() {
		return (
			<>
				<Toaster position={"top-right"} />
				<Outlet />
			</>
		);
	},
});
