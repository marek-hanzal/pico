import { createFileRoute } from "@tanstack/react-router";
import { withBuildingGraph } from "~/app/derivean/utils/withBuildingGraph";

export const Route = createFileRoute(
	"/$locale/apps/derivean/game/building/construction",
)({
	async loader() {
		return {
			graph: await withBuildingGraph(),
		};
	},
});
