import {z} from "@use-pico/utils";

export const JobShapeSchema = z.object({
    id:           z.string().nonempty({message: "Non-empty"}),
    service:      z.string().nonempty({message: "Non-empty"}),
    reference:    z.string().nullish(),
    status:       z.number(),
    total:        z.number(),
    progress:     z.any(),
    successCount: z.number(),
    errorCount:   z.number(),
    skipCount:    z.number(),
    request:      z.any().nullish(),
    response:     z.any().nullish(),
    started:      z.string(),
    finished:     z.string().nullish(),
    commit:       z.boolean(),
    userId:       z.string().nonempty({message: "Non-empty"}),
});
export type JobShapeSchema = typeof JobShapeSchema;
export namespace JobShapeSchema {
    export type Type = z.infer<JobShapeSchema>;
}