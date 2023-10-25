import {useErrorNotification}  from "@use-pico/hook";
import {type RequestSchema}    from "@use-pico/schema";
import {
    useEffect,
    useState
}                              from "react";
import {type IJobManager}      from "../api/IJobManager";
import {IJobStatus}            from "../api/IJobStatus";
import {type JobQueryMutation} from "../api/JobQueryMutation";
import {type JobFilterSchema}  from "../schema/JobFilterSchema";
import {type JobSchema}        from "../schema/JobSchema";

export namespace useJobManager {
    export interface Props<
        TRequestSchema extends RequestSchema,
    > {
        service: string;
        mutation: JobQueryMutation.WithMutation<TRequestSchema>;
        query: JobQueryMutation.Query;
        filter?: JobFilterSchema.Type;
        interval?: number;

        onJob?(job: JobSchema.Type): void;

        onStart?(job: JobSchema.Type): void;

        onSuccess?(job: JobSchema.Type): void;

        onError?(job: JobSchema.Type): void;

        onInterrupt?(job: JobSchema.Type): void;

        onSettled?(job: JobSchema.Type): void;
    }
}
export type useJobManager<
    TRequestSchema extends RequestSchema,
> = typeof useJobManager<TRequestSchema>;

export const useJobManager = <
    TRequestSchema extends RequestSchema,
>(
    {
        service,
        filter,
        mutation,
        query,
        interval = 1000,
        onJob,
        onStart,
        onSuccess,
        onError,
        onInterrupt,
        onSettled,
    }: useJobManager.Props<TRequestSchema>
): IJobManager<TRequestSchema> => {
    const [job, setJob] = useState<JobSchema.Type | null | undefined>();
    const asyncMutation = mutation.withAsyncMutation.useMutation();
    const interruptMutation = mutation.withInterruptMutation.useMutation();
    const jobMutation = mutation.withJobMutation.useMutation();
    const watchInvalidator = query.withFindByQuery.useInvalidator();
    const updateWith = query.withFindByQuery.useUpdateWith();
    const errorNotification = useErrorNotification();
    const watch = query.withFindByQuery.useQueryEx({
        request: {
            where: {
                service,
            },
            filter,
        },
        options: {
            refetchInterval: interval,
        },
    });

    useEffect(() => {
        setJob(prev => {
            if (!watch.isSuccess) {
                return null;
            } else if (!watch.data) {
                return watch.data;
            } else if (prev?.status === watch.data?.status) {
                return watch.data;
            }

            onJob?.(watch.data);

            const check = [
                {
                    status:  [IJobStatus.ERROR],
                    handler: onError,
                },
                {
                    status:  [IJobStatus.SUCCESS],
                    handler: onSuccess,
                },
                {
                    status:  IJobStatus.JOB_SETTLED,
                    handler: onSettled,
                },
            ] as const;

            for (const {
                status,
                handler
            } of check) {
                /**
                 * Do not break loop as there could be more handlers on the same status.
                 */
                prev?.status !== undefined && prev.status !== watch.data.status && status.includes(watch.data.status) && handler?.(watch.data);
            }

            return watch.data;
        });
    }, [watch.data]);

    const isRunning = () => {
        return job?.status === IJobStatus.RUNNING;
    };
    const isPending = () => {
        return IJobStatus.JOB_PENDING.includes(job?.status ?? -1);
    };
    const isSettled = () => {
        return IJobStatus.JOB_SETTLED.includes(job?.status ?? -1);
    };

    return {
        service,
        useJob:     () => {
            return job;
        },
        mutation: {
            asyncMutation,
            jobMutation,
            interruptMutation,
        },
        start:      request => {
            asyncMutation.mutate(request, {
                onSuccess: job => {
                    setJob(job);
                    onStart?.(job);
                },
                onError:   () => {
                    errorNotification({
                        withTranslation: {
                            label: "start",
                        },
                    });
                },
            });
        },
        interrupt:  () => {
            job && setJob({
                ...job,
                status: IJobStatus.INTERRUPTED,
            });
            !job && errorNotification({
                withTranslation: {
                    label: "interrupt.no-job",
                },
            });
            job && interruptMutation.mutate({
                id: job.id,
            }, {
                onSuccess: async job => {
                    updateWith(job);
                    await watchInvalidator();
                    onInterrupt?.(job);
                },
                onError:   () => {
                    errorNotification({
                        withTranslation: {
                            label: "interrupt",
                        },
                    });
                }
            });
        },
        delete:     () => {
            jobMutation.mutate({
                delete: {
                    where: {
                        service,
                    },
                },
            }, {
                onSuccess: async () => {
                    updateWith(null);
                    setJob(null);
                    await watchInvalidator();
                },
                onError:   () => {
                    errorNotification({
                        withTranslation: {
                            label: "delete",
                        },
                    });
                }
            });
        },
        isSettled,
        isRunning,
        isCommit:   () => {
            return job?.commit ?? false;
        },
        isLoading:  () => {
            if (asyncMutation.isPending) {
                return true;
            } else if (isRunning()) {
                return true;
            } else if (job === undefined) {
                return true;
            } else if (isPending()) {
                return true;
            } else if (watch.isLoading) {
                return true;
            }
            return false;
        },
        isDisabled: () => {
            return !!job && isSettled() && !job?.commit;
        },
        isFetching: () => {
            return asyncMutation.isPending || interruptMutation.isPending || jobMutation.isPaused || watch.isLoading;
        },
        isPending:  () => {
            return IJobStatus.JOB_PENDING.includes(job?.status || -1);
        },
        withCommit: () => {
            return !!job && isSettled() && !job.commit;
        },
        watch
    };
};
