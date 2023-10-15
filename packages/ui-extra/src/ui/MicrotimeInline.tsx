import {
    DateTimeInline,
    type IDateInput
}                from "@use-pico/i18n";
import {
    Group,
    Text
}                from "@use-pico/ui";
import {type FC} from "react";

export namespace MicrotimeInline {
    export interface Props {
        date: IDateInput;
    }
}

export const MicrotimeInline: FC<MicrotimeInline.Props> = (
    {
        date,
    }
) => {
    return <Group gap={1}>
        <Group gap={"xs"}>
            <Text
                c={"dimmed"}
            >
                <DateTimeInline
                    date={date}
                    options={{
                        year:  "numeric",
                        month: "numeric",
                        day:   "numeric",
                    }}
                />
            </Text>
            <Text
                fw={600}
            >
                <DateTimeInline
                    date={date}
                    options={{
                        hour:   "numeric",
                        minute: "numeric",
                        second: "numeric",
                    }}
                />
            </Text>
        </Group>,
        <Text c={"dimmed"} size={"xs"}>
            <DateTimeInline
                date={date}
                options={{
                    fractionalSecondDigits: 3,
                }}
            />
        </Text>
    </Group>;
};
