import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { BlueprintPreview } from "~/app/derivean/blueprint/BlueprintPreview";

export const Route = createFileRoute(
	"/$locale/apps/derivean/root/blueprint/$id/view/",
)({
	component: () => {
		const { blueprint } = useLoaderData({
			from: "/$locale/apps/derivean/root/blueprint/$id",
		});

		return (
			<div>
				<BlueprintPreview entity={blueprint} />
			</div>
		);
	},
});
