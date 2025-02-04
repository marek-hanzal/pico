import {
    IdentitySchema,
    withBoolSchema,
    withSourceSchema,
    type FilterSchema,
    type ShapeSchema,
} from "@use-pico/common";
import { z } from "zod";

export const withBlueprintSchema = <
	TShapeSchema extends ShapeSchema,
	TFilterSchema extends FilterSchema,
>({
	shape,
	filter,
}: {
	shape: TShapeSchema;
	filter: TFilterSchema;
}) => {
	return withSourceSchema({
		entity: IdentitySchema.merge(
			z.object({
				name:
					// varchar(64) / not nullable
					z.string().min(1),
				cycles:
					// INTEGER / not nullable
					z.number().int(),
				sort:
					// INTEGER / not nullable
					z.number().int(),
				limit:
					// INTEGER / not nullable
					z.number().int(),
				image:
					// TEXT / nullable
					z.string().nullish(),
			}),
		),
		shape,
		filter,
		sort: ["id", "name", "cycles", "sort", "limit", "image"],
	});
};

export type BlueprintEntity = ReturnType<typeof withBlueprintSchema>["~entity"];

export const withBlueprintConflictSchema = <
	TShapeSchema extends ShapeSchema,
	TFilterSchema extends FilterSchema,
>({
	shape,
	filter,
}: {
	shape: TShapeSchema;
	filter: TFilterSchema;
}) => {
	return withSourceSchema({
		entity: IdentitySchema.merge(
			z.object({
				blueprintId:
					// varchar(36) / not nullable
					z.string().min(1),
				conflictId:
					// varchar(36) / not nullable
					z.string().min(1),
			}),
		),
		shape,
		filter,
		sort: ["id", "blueprintId", "conflictId"],
	});
};

export type BlueprintConflictEntity = ReturnType<
	typeof withBlueprintConflictSchema
>["~entity"];

export const withBlueprintDependencySchema = <
	TShapeSchema extends ShapeSchema,
	TFilterSchema extends FilterSchema,
>({
	shape,
	filter,
}: {
	shape: TShapeSchema;
	filter: TFilterSchema;
}) => {
	return withSourceSchema({
		entity: IdentitySchema.merge(
			z.object({
				blueprintId:
					// varchar(36) / not nullable
					z.string().min(1),
				dependencyId:
					// varchar(36) / not nullable
					z.string().min(1),
			}),
		),
		shape,
		filter,
		sort: ["id", "blueprintId", "dependencyId"],
	});
};

export type BlueprintDependencyEntity = ReturnType<
	typeof withBlueprintDependencySchema
>["~entity"];

export const withBlueprintInventorySchema = <
	TShapeSchema extends ShapeSchema,
	TFilterSchema extends FilterSchema,
>({
	shape,
	filter,
}: {
	shape: TShapeSchema;
	filter: TFilterSchema;
}) => {
	return withSourceSchema({
		entity: IdentitySchema.merge(
			z.object({
				blueprintId:
					// varchar(36) / not nullable
					z.string().min(1),
				inventoryId:
					// varchar(36) / not nullable
					z.string().min(1),
			}),
		),
		shape,
		filter,
		sort: ["id", "blueprintId", "inventoryId"],
	});
};

export type BlueprintInventoryEntity = ReturnType<
	typeof withBlueprintInventorySchema
>["~entity"];

export const withBlueprintProductionSchema = <
	TShapeSchema extends ShapeSchema,
	TFilterSchema extends FilterSchema,
>({
	shape,
	filter,
}: {
	shape: TShapeSchema;
	filter: TFilterSchema;
}) => {
	return withSourceSchema({
		entity: IdentitySchema.merge(
			z.object({
				blueprintId:
					// varchar(36) / not nullable
					z.string().min(1),
				resourceId:
					// varchar(36) / not nullable
					z.string().min(1),
				amount:
					// float4 / not nullable
					z.number(),
				cycles:
					// INTEGER / not nullable
					z.number().int(),
			}),
		),
		shape,
		filter,
		sort: ["id", "blueprintId", "resourceId", "amount", "cycles"],
	});
};

export type BlueprintProductionEntity = ReturnType<
	typeof withBlueprintProductionSchema
>["~entity"];

export const withBlueprintProductionDependencySchema = <
	TShapeSchema extends ShapeSchema,
	TFilterSchema extends FilterSchema,
>({
	shape,
	filter,
}: {
	shape: TShapeSchema;
	filter: TFilterSchema;
}) => {
	return withSourceSchema({
		entity: IdentitySchema.merge(
			z.object({
				blueprintProductionId:
					// varchar(36) / not nullable
					z.string().min(1),
				blueprintId:
					// varchar(36) / not nullable
					z.string().min(1),
			}),
		),
		shape,
		filter,
		sort: ["id", "blueprintProductionId", "blueprintId"],
	});
};

export type BlueprintProductionDependencyEntity = ReturnType<
	typeof withBlueprintProductionDependencySchema
>["~entity"];

export const withBlueprintProductionRequirementSchema = <
	TShapeSchema extends ShapeSchema,
	TFilterSchema extends FilterSchema,
>({
	shape,
	filter,
}: {
	shape: TShapeSchema;
	filter: TFilterSchema;
}) => {
	return withSourceSchema({
		entity: IdentitySchema.merge(
			z.object({
				blueprintProductionId:
					// varchar(36) / not nullable
					z.string().min(1),
				resourceId:
					// varchar(36) / not nullable
					z.string().min(1),
				amount:
					// float4 / not nullable
					z.number(),
				passive:
					// boolean / not nullable
					withBoolSchema(),
			}),
		),
		shape,
		filter,
		sort: ["id", "blueprintProductionId", "resourceId", "amount", "passive"],
	});
};

export type BlueprintProductionRequirementEntity = ReturnType<
	typeof withBlueprintProductionRequirementSchema
>["~entity"];

export const withBlueprintProductionResourceSchema = <
	TShapeSchema extends ShapeSchema,
	TFilterSchema extends FilterSchema,
>({
	shape,
	filter,
}: {
	shape: TShapeSchema;
	filter: TFilterSchema;
}) => {
	return withSourceSchema({
		entity: IdentitySchema.merge(
			z.object({
				blueprintProductionId:
					// varchar(36) / not nullable
					z.string().min(1),
				resourceId:
					// varchar(36) / not nullable
					z.string().min(1),
				amount:
					// float4 / not nullable
					z.number(),
			}),
		),
		shape,
		filter,
		sort: ["id", "blueprintProductionId", "resourceId", "amount"],
	});
};

export type BlueprintProductionResourceEntity = ReturnType<
	typeof withBlueprintProductionResourceSchema
>["~entity"];

export const withBlueprintRegionSchema = <
	TShapeSchema extends ShapeSchema,
	TFilterSchema extends FilterSchema,
>({
	shape,
	filter,
}: {
	shape: TShapeSchema;
	filter: TFilterSchema;
}) => {
	return withSourceSchema({
		entity: IdentitySchema.merge(
			z.object({
				blueprintId:
					// varchar(36) / not nullable
					z.string().min(1),
				regionId:
					// varchar(36) / not nullable
					z.string().min(1),
			}),
		),
		shape,
		filter,
		sort: ["id", "blueprintId", "regionId"],
	});
};

export type BlueprintRegionEntity = ReturnType<
	typeof withBlueprintRegionSchema
>["~entity"];

export const withBlueprintRequirementSchema = <
	TShapeSchema extends ShapeSchema,
	TFilterSchema extends FilterSchema,
>({
	shape,
	filter,
}: {
	shape: TShapeSchema;
	filter: TFilterSchema;
}) => {
	return withSourceSchema({
		entity: IdentitySchema.merge(
			z.object({
				blueprintId:
					// varchar(36) / not nullable
					z.string().min(1),
				resourceId:
					// varchar(36) / not nullable
					z.string().min(1),
				amount:
					// float4 / not nullable
					z.number(),
				passive:
					// boolean / not nullable
					withBoolSchema(),
			}),
		),
		shape,
		filter,
		sort: ["id", "blueprintId", "resourceId", "amount", "passive"],
	});
};

export type BlueprintRequirementEntity = ReturnType<
	typeof withBlueprintRequirementSchema
>["~entity"];

export const withBuildingSchema = <
	TShapeSchema extends ShapeSchema,
	TFilterSchema extends FilterSchema,
>({
	shape,
	filter,
}: {
	shape: TShapeSchema;
	filter: TFilterSchema;
}) => {
	return withSourceSchema({
		entity: IdentitySchema.merge(
			z.object({
				userId:
					// varchar(36) / not nullable
					z.string().min(1),
				plotId:
					// varchar(36) / not nullable
					z.string().min(1),
				blueprintId:
					// varchar(36) / not nullable
					z.string().min(1),
				constructionId:
					// varchar(36) / nullable
					z.string().nullish(),
				landId:
					// varchar(36) / not nullable
					z.string().min(1),
				productionId:
					// varchar(36) / nullable
					z.string().nullish(),
				recurringProductionId:
					// varchar(36) / nullable
					z.string().nullish(),
				valid:
					// boolean / not nullable
					withBoolSchema(),
			}),
		),
		shape,
		filter,
		sort: [
			"id",
			"userId",
			"plotId",
			"blueprintId",
			"constructionId",
			"landId",
			"productionId",
			"recurringProductionId",
			"valid",
		],
	});
};

export type BuildingEntity = ReturnType<typeof withBuildingSchema>["~entity"];

export const withBuildingInventorySchema = <
	TShapeSchema extends ShapeSchema,
	TFilterSchema extends FilterSchema,
>({
	shape,
	filter,
}: {
	shape: TShapeSchema;
	filter: TFilterSchema;
}) => {
	return withSourceSchema({
		entity: IdentitySchema.merge(
			z.object({
				buildingId:
					// varchar(36) / not nullable
					z.string().min(1),
				inventoryId:
					// varchar(36) / not nullable
					z.string().min(1),
			}),
		),
		shape,
		filter,
		sort: ["id", "buildingId", "inventoryId"],
	});
};

export type BuildingInventoryEntity = ReturnType<
	typeof withBuildingInventorySchema
>["~entity"];

export const withBuildingToBuildingSchema = <
	TShapeSchema extends ShapeSchema,
	TFilterSchema extends FilterSchema,
>({
	shape,
	filter,
}: {
	shape: TShapeSchema;
	filter: TFilterSchema;
}) => {
	return withSourceSchema({
		entity: IdentitySchema.merge(
			z.object({
				userId:
					// varchar(36) / not nullable
					z.string().min(1),
				mapId:
					// varchar(36) / not nullable
					z.string().min(1),
				buildingId:
					// varchar(36) / not nullable
					z.string().min(1),
				linkId:
					// varchar(36) / not nullable
					z.string().min(1),
			}),
		),
		shape,
		filter,
		sort: ["id", "userId", "mapId", "buildingId", "linkId"],
	});
};

export type BuildingToBuildingEntity = ReturnType<
	typeof withBuildingToBuildingSchema
>["~entity"];

export const withConstructionSchema = <
	TShapeSchema extends ShapeSchema,
	TFilterSchema extends FilterSchema,
>({
	shape,
	filter,
}: {
	shape: TShapeSchema;
	filter: TFilterSchema;
}) => {
	return withSourceSchema({
		entity: IdentitySchema.merge(
			z.object({
				userId:
					// varchar(36) / not nullable
					z.string().min(1),
				plan:
					// boolean / not nullable
					withBoolSchema(),
				cycles:
					// INTEGER / not nullable
					z.number().int(),
				cycle:
					// INTEGER / not nullable
					z.number().int(),
			}),
		),
		shape,
		filter,
		sort: ["id", "userId", "plan", "cycles", "cycle"],
	});
};

export type ConstructionEntity = ReturnType<
	typeof withConstructionSchema
>["~entity"];

export const withCycleSchema = <
	TShapeSchema extends ShapeSchema,
	TFilterSchema extends FilterSchema,
>({
	shape,
	filter,
}: {
	shape: TShapeSchema;
	filter: TFilterSchema;
}) => {
	return withSourceSchema({
		entity: IdentitySchema.merge(
			z.object({
				userId:
					// varchar(36) / not nullable
					z.string().min(1),
				mapId:
					// varchar(36) / not nullable
					z.string().min(1),
				stamp:
					// datetime / not nullable
					z.string(),
			}),
		),
		shape,
		filter,
		sort: ["id", "userId", "mapId", "stamp"],
	});
};

export type CycleEntity = ReturnType<typeof withCycleSchema>["~entity"];

export const withDemandSchema = <
	TShapeSchema extends ShapeSchema,
	TFilterSchema extends FilterSchema,
>({
	shape,
	filter,
}: {
	shape: TShapeSchema;
	filter: TFilterSchema;
}) => {
	return withSourceSchema({
		entity: IdentitySchema.merge(
			z.object({
				userId:
					// varchar(36) / not nullable
					z.string().min(1),
				mapId:
					// varchar(36) / not nullable
					z.string().min(1),
				buildingId:
					// varchar(36) / not nullable
					z.string().min(1),
				resourceId:
					// varchar(36) / not nullable
					z.string().min(1),
				amount:
					// float4 / not nullable
					z.number(),
				priority:
					// INTEGER / not nullable
					z.number().int(),
				type:
					// varchar(16) / not nullable
					z.string().min(1),
			}),
		),
		shape,
		filter,
		sort: [
			"id",
			"userId",
			"mapId",
			"buildingId",
			"resourceId",
			"amount",
			"priority",
			"type",
		],
	});
};

export type DemandEntity = ReturnType<typeof withDemandSchema>["~entity"];

export const withInventorySchema = <
	TShapeSchema extends ShapeSchema,
	TFilterSchema extends FilterSchema,
>({
	shape,
	filter,
}: {
	shape: TShapeSchema;
	filter: TFilterSchema;
}) => {
	return withSourceSchema({
		entity: IdentitySchema.merge(
			z.object({
				resourceId:
					// varchar(36) / not nullable
					z.string().min(1),
				amount:
					// float4 / not nullable
					z.number(),
				limit:
					// float4 / not nullable
					z.number(),
				type:
					// varchar(16) / not nullable
					z.string().min(1),
			}),
		),
		shape,
		filter,
		sort: ["id", "resourceId", "amount", "limit", "type"],
	});
};

export type InventoryEntity = ReturnType<typeof withInventorySchema>["~entity"];

export const withLandSchema = <
	TShapeSchema extends ShapeSchema,
	TFilterSchema extends FilterSchema,
>({
	shape,
	filter,
}: {
	shape: TShapeSchema;
	filter: TFilterSchema;
}) => {
	return withSourceSchema({
		entity: IdentitySchema.merge(
			z.object({
				mapId:
					// varchar(36) / not nullable
					z.string().min(1),
				regionId:
					// varchar(36) / not nullable
					z.string().min(1),
				position:
					// INTEGER / not nullable
					z.number().int(),
			}),
		),
		shape,
		filter,
		sort: ["id", "mapId", "regionId", "position"],
	});
};

export type LandEntity = ReturnType<typeof withLandSchema>["~entity"];

export const withLandInventorySchema = <
	TShapeSchema extends ShapeSchema,
	TFilterSchema extends FilterSchema,
>({
	shape,
	filter,
}: {
	shape: TShapeSchema;
	filter: TFilterSchema;
}) => {
	return withSourceSchema({
		entity: IdentitySchema.merge(
			z.object({
				landId:
					// varchar(36) / not nullable
					z.string().min(1),
				inventoryId:
					// varchar(36) / not nullable
					z.string().min(1),
			}),
		),
		shape,
		filter,
		sort: ["id", "landId", "inventoryId"],
	});
};

export type LandInventoryEntity = ReturnType<
	typeof withLandInventorySchema
>["~entity"];

export const withMapSchema = <
	TShapeSchema extends ShapeSchema,
	TFilterSchema extends FilterSchema,
>({
	shape,
	filter,
}: {
	shape: TShapeSchema;
	filter: TFilterSchema;
}) => {
	return withSourceSchema({
		entity: IdentitySchema.merge(
			z.object({
				userId:
					// varchar(36) / not nullable
					z.string().min(1),
				name:
					// varchar(128) / not nullable
					z.string().min(1),
			}),
		),
		shape,
		filter,
		sort: ["id", "userId", "name"],
	});
};

export type MapEntity = ReturnType<typeof withMapSchema>["~entity"];

export const withPlotSchema = <
	TShapeSchema extends ShapeSchema,
	TFilterSchema extends FilterSchema,
>({
	shape,
	filter,
}: {
	shape: TShapeSchema;
	filter: TFilterSchema;
}) => {
	return withSourceSchema({
		entity: IdentitySchema.merge(
			z.object({
				userId:
					// varchar(36) / not nullable
					z.string().min(1),
				mapId:
					// varchar(36) / not nullable
					z.string().min(1),
				landId:
					// varchar(36) / not nullable
					z.string().min(1),
				position:
					// INTEGER / not nullable
					z.number().int(),
			}),
		),
		shape,
		filter,
		sort: ["id", "userId", "mapId", "landId", "position"],
	});
};

export type PlotEntity = ReturnType<typeof withPlotSchema>["~entity"];

export const withProductionSchema = <
	TShapeSchema extends ShapeSchema,
	TFilterSchema extends FilterSchema,
>({
	shape,
	filter,
}: {
	shape: TShapeSchema;
	filter: TFilterSchema;
}) => {
	return withSourceSchema({
		entity: IdentitySchema.merge(
			z.object({
				userId:
					// varchar(36) / not nullable
					z.string().min(1),
				buildingId:
					// varchar(36) / not nullable
					z.string().min(1),
				blueprintProductionId:
					// varchar(36) / not nullable
					z.string().min(1),
				cycles:
					// INTEGER / not nullable
					z.number().int(),
				cycle:
					// INTEGER / not nullable
					z.number().int(),
			}),
		),
		shape,
		filter,
		sort: [
			"id",
			"userId",
			"buildingId",
			"blueprintProductionId",
			"cycles",
			"cycle",
		],
	});
};

export type ProductionEntity = ReturnType<
	typeof withProductionSchema
>["~entity"];

export const withRegionSchema = <
	TShapeSchema extends ShapeSchema,
	TFilterSchema extends FilterSchema,
>({
	shape,
	filter,
}: {
	shape: TShapeSchema;
	filter: TFilterSchema;
}) => {
	return withSourceSchema({
		entity: IdentitySchema.merge(
			z.object({
				name:
					// varchar(128) / not nullable
					z.string().min(1),
				probability:
					// INTEGER / not nullable
					z.number().int(),
				limit:
					// INTEGER / not nullable
					z.number().int(),
				image:
					// TEXT / nullable
					z.string().nullish(),
			}),
		),
		shape,
		filter,
		sort: ["id", "name", "probability", "limit", "image"],
	});
};

export type RegionEntity = ReturnType<typeof withRegionSchema>["~entity"];

export const withRegionInventorySchema = <
	TShapeSchema extends ShapeSchema,
	TFilterSchema extends FilterSchema,
>({
	shape,
	filter,
}: {
	shape: TShapeSchema;
	filter: TFilterSchema;
}) => {
	return withSourceSchema({
		entity: IdentitySchema.merge(
			z.object({
				regionId:
					// varchar(36) / not nullable
					z.string().min(1),
				resourceId:
					// varchar(36) / not nullable
					z.string().min(1),
				minAmount:
					// float4 / not nullable
					z.number(),
				maxAmount:
					// float4 / not nullable
					z.number(),
				minLimit:
					// float4 / not nullable
					z.number(),
				maxLimit:
					// float4 / not nullable
					z.number(),
			}),
		),
		shape,
		filter,
		sort: [
			"id",
			"regionId",
			"resourceId",
			"minAmount",
			"maxAmount",
			"minLimit",
			"maxLimit",
		],
	});
};

export type RegionInventoryEntity = ReturnType<
	typeof withRegionInventorySchema
>["~entity"];

export const withResourceSchema = <
	TShapeSchema extends ShapeSchema,
	TFilterSchema extends FilterSchema,
>({
	shape,
	filter,
}: {
	shape: TShapeSchema;
	filter: TFilterSchema;
}) => {
	return withSourceSchema({
		entity: IdentitySchema.merge(
			z.object({
				name:
					// varchar(64) / not nullable
					z.string().min(1),
				weight:
					// INTEGER / not nullable
					z.number().int(),
				image:
					// TEXT / nullable
					z.string().nullish(),
			}),
		),
		shape,
		filter,
		sort: ["id", "name", "weight", "image"],
	});
};

export type ResourceEntity = ReturnType<typeof withResourceSchema>["~entity"];

export const withResourceTagSchema = <
	TShapeSchema extends ShapeSchema,
	TFilterSchema extends FilterSchema,
>({
	shape,
	filter,
}: {
	shape: TShapeSchema;
	filter: TFilterSchema;
}) => {
	return withSourceSchema({
		entity: IdentitySchema.merge(
			z.object({
				resourceId:
					// varchar(36) / not nullable
					z.string().min(1),
				tagId:
					// varchar(36) / not nullable
					z.string().min(1),
			}),
		),
		shape,
		filter,
		sort: ["id", "resourceId", "tagId"],
	});
};

export type ResourceTagEntity = ReturnType<
	typeof withResourceTagSchema
>["~entity"];

export const withRoadSchema = <
	TShapeSchema extends ShapeSchema,
	TFilterSchema extends FilterSchema,
>({
	shape,
	filter,
}: {
	shape: TShapeSchema;
	filter: TFilterSchema;
}) => {
	return withSourceSchema({
		entity: IdentitySchema.merge(
			z.object({
				plotId:
					// varchar(36) / not nullable
					z.string().min(1),
			}),
		),
		shape,
		filter,
		sort: ["id", "plotId"],
	});
};

export type RoadEntity = ReturnType<typeof withRoadSchema>["~entity"];

export const withSupplySchema = <
	TShapeSchema extends ShapeSchema,
	TFilterSchema extends FilterSchema,
>({
	shape,
	filter,
}: {
	shape: TShapeSchema;
	filter: TFilterSchema;
}) => {
	return withSourceSchema({
		entity: IdentitySchema.merge(
			z.object({
				userId:
					// varchar(36) / not nullable
					z.string().min(1),
				mapId:
					// varchar(36) / not nullable
					z.string().min(1),
				buildingId:
					// varchar(36) / not nullable
					z.string().min(1),
				resourceId:
					// varchar(36) / not nullable
					z.string().min(1),
			}),
		),
		shape,
		filter,
		sort: ["id", "userId", "mapId", "buildingId", "resourceId"],
	});
};

export type SupplyEntity = ReturnType<typeof withSupplySchema>["~entity"];

export const withTagSchema = <
	TShapeSchema extends ShapeSchema,
	TFilterSchema extends FilterSchema,
>({
	shape,
	filter,
}: {
	shape: TShapeSchema;
	filter: TFilterSchema;
}) => {
	return withSourceSchema({
		entity: IdentitySchema.merge(
			z.object({
				code:
					// varchar(64) / not nullable
					z.string().min(1),
				label:
					// varchar(128) / not nullable
					z.string().min(1),
				group:
					// varchar(64) / nullable
					z.string().nullish(),
				sort:
					// INTEGER / not nullable
					z.number().int(),
			}),
		),
		shape,
		filter,
		sort: ["id", "code", "label", "group", "sort"],
	});
};

export type TagEntity = ReturnType<typeof withTagSchema>["~entity"];

export const withTransportSchema = <
	TShapeSchema extends ShapeSchema,
	TFilterSchema extends FilterSchema,
>({
	shape,
	filter,
}: {
	shape: TShapeSchema;
	filter: TFilterSchema;
}) => {
	return withSourceSchema({
		entity: IdentitySchema.merge(
			z.object({
				userId:
					// varchar(36) / not nullable
					z.string().min(1),
				mapId:
					// varchar(36) / not nullable
					z.string().min(1),
				resourceId:
					// varchar(36) / not nullable
					z.string().min(1),
				roadId:
					// varchar(36) / not nullable
					z.string().min(1),
				sourceId:
					// varchar(36) / not nullable
					z.string().min(1),
				targetId:
					// varchar(36) / not nullable
					z.string().min(1),
				amount:
					// float4 / not nullable
					z.number(),
				type:
					// varchar(16) / not nullable
					z.string().min(1),
			}),
		),
		shape,
		filter,
		sort: [
			"id",
			"userId",
			"mapId",
			"resourceId",
			"roadId",
			"sourceId",
			"targetId",
			"amount",
			"type",
		],
	});
};

export type TransportEntity = ReturnType<typeof withTransportSchema>["~entity"];

export const withUserSchema = <
	TShapeSchema extends ShapeSchema,
	TFilterSchema extends FilterSchema,
>({
	shape,
	filter,
}: {
	shape: TShapeSchema;
	filter: TFilterSchema;
}) => {
	return withSourceSchema({
		entity: IdentitySchema.merge(
			z.object({
				name:
					// varchar(64) / not nullable
					z.string().min(1),
				login:
					// varchar(128) / not nullable
					z.string().min(1),
				password:
					// varchar(256) / not nullable
					z.string().min(1),
			}),
		),
		shape,
		filter,
		sort: ["id", "name", "login", "password"],
	});
};

export type UserEntity = ReturnType<typeof withUserSchema>["~entity"];

export interface Database {
	Blueprint: BlueprintEntity;
	Blueprint_Conflict: BlueprintConflictEntity;
	Blueprint_Dependency: BlueprintDependencyEntity;
	Blueprint_Inventory: BlueprintInventoryEntity;
	Blueprint_Production: BlueprintProductionEntity;
	Blueprint_Production_Dependency: BlueprintProductionDependencyEntity;
	Blueprint_Production_Requirement: BlueprintProductionRequirementEntity;
	Blueprint_Production_Resource: BlueprintProductionResourceEntity;
	Blueprint_Region: BlueprintRegionEntity;
	Blueprint_Requirement: BlueprintRequirementEntity;
	Building: BuildingEntity;
	Building_Inventory: BuildingInventoryEntity;
	Building_To_Building: BuildingToBuildingEntity;
	Construction: ConstructionEntity;
	Cycle: CycleEntity;
	Demand: DemandEntity;
	Inventory: InventoryEntity;
	Land: LandEntity;
	Land_Inventory: LandInventoryEntity;
	Map: MapEntity;
	Plot: PlotEntity;
	Production: ProductionEntity;
	Region: RegionEntity;
	Region_Inventory: RegionInventoryEntity;
	Resource: ResourceEntity;
	Resource_Tag: ResourceTagEntity;
	Road: RoadEntity;
	Supply: SupplyEntity;
	Tag: TagEntity;
	Transport: TransportEntity;
	User: UserEntity;
}
