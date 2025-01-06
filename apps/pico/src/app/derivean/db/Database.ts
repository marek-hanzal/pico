import type { BaseBuildingSchema } from "~/app/derivean/building/base/BaseBuildingSchema";
import type { BaseBuildingLimitSchema } from "~/app/derivean/building/base/limit/BaseBuildingLimitSchema";
import type { BaseBuildingProductionSchema } from "~/app/derivean/building/base/production/BaseBuildingProductionSchema";
import type { BaseBuildingProductionRequirementSchema } from "~/app/derivean/building/base/production/requirement/BaseBuildingProductionRequirementSchema";
import type { BaseBuildingRequirementSchema } from "~/app/derivean/building/base/requirement/BaseBuildingRequirementSchema";
import type { BuildingSchema } from "~/app/derivean/building/BuildingSchema";
import type { BuildingProductionQueueSchema } from "~/app/derivean/building/production/BuildingProductionQueueSchema";
import type { BuildingQueueSchema } from "~/app/derivean/building/queue/BuildingQueueSchema";
import type { BuildingResourceSchema } from "~/app/derivean/building/resource/BuildingResourceSchema";
import type { CycleSchema } from "~/app/derivean/cycle/CycleSchema";
import type { InventorySchema } from "~/app/derivean/inventory/InventorySchema";
import type { ResourceSchema } from "~/app/derivean/resource/ResourceSchema";
import type { ResourceTagSchema } from "~/app/derivean/resource/tag/ResourceTagSchema";
import type { TagSchema } from "~/app/derivean/tag/TagSchema";
import type { UserSchema } from "~/app/derivean/user/UserSchema";

export interface Database {
	User: UserSchema["~entity"];
	Tag: TagSchema["~entity"];

	Resource: ResourceSchema["~entity"];
	Resource_Tag: ResourceTagSchema["~entity"];

	BaseBuilding: BaseBuildingSchema["~entity"];
	BaseBuilding_Requirement: BaseBuildingRequirementSchema["~entity"];
	BaseBuilding_Limit: BaseBuildingLimitSchema["~entity"];
	BaseBuildingProduction: BaseBuildingProductionSchema["~entity"];
	BaseBuildingProductionRequirement: BaseBuildingProductionRequirementSchema["~entity"];

	Building: BuildingSchema["~entity"];
	Building_Resource: BuildingResourceSchema["~entity"];
	BuildingQueue: BuildingQueueSchema["~entity"];
	BuildingProductionQueue: BuildingProductionQueueSchema["~entity"];

	Inventory: InventorySchema["~entity"];

	Cycle: CycleSchema["~entity"];
}
