"use client";

import {IconCheck}            from "@tabler/icons-react";
import {WithTranslationStore} from "@use-pico/i18n";
import {withNotification}     from "@use-pico/ui";

export namespace useSuccessNotification {
    export interface Props extends Omit<withNotification.Props, "title" | "message"> {
    }
}

export const useSuccessNotification = () => {
    const translation = WithTranslationStore.use$();
    return (
        {
            withTranslation,
            ...props
        }: useSuccessNotification.Props = {}
    ) => {
        const $withTranslation = {
            ...withTranslation,
            label: [withTranslation?.label, "success"].filter(Boolean).join("."),
        };
        withNotification({
            withTranslation: translation?.withTranslation($withTranslation) || $withTranslation,
            icon:            <IconCheck size={"1.1rem"}/>,
            color:           "teal",
            ...props,
        });
    };
};
