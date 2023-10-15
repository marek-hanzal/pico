"use client";

import {DateInline}          from "@pico/i18n";
import {
    ActionIcon,
    Box,
    Button,
    Overlay
}                            from "@pico/ui";
import {
    IconCalendarSearch,
    IconX
}                            from "@tabler/icons-react";
import {useState}            from "react";
import {CalendarEventSchema} from "../schema/CalendarEventSchema";
import {MonthsOfStore}       from "../store/MonthsOfStore";
import {WeeksOfStore}        from "../store/WeeksOfStore";
import {YearsOfStore}        from "../store/YearsOfStore";
import {Months}              from "./Months";
import {
    type IWeeksProps,
    Weeks
}                            from "./Weeks";
import {Years}               from "./Years";

export namespace Calendar {
    export interface Props<
        TEventSchema extends CalendarEventSchema = CalendarEventSchema,
    > extends IWeeksProps<TEventSchema> {
        withControls?: boolean;
    }
}

export const Calendar = <
    TEventSchema extends CalendarEventSchema = CalendarEventSchema,
>(
    {
        onClick,
        withControls = true,
        onChange,
        ...props
    }: Calendar.Props<TEventSchema>) => {
    const weeksOf = WeeksOfStore.use((
        {
            weeksOf,
            weeks
        }) => ({
        weeksOf,
        weeks
    }));
    const monthsOf = MonthsOfStore.use(({monthsOf}) => ({monthsOf}));
    const yearsOf = YearsOfStore.use(({yearsOf}) => ({yearsOf}));
    const [selectMonth, setSelectMonth] = useState(false);
    const [selectYear, setSelectYear] = useState(false);
    return <Box pos={"relative"}>
        <Weeks<TEventSchema>
            onClick={onClick}
            withControls={withControls}
            onChange={onChange}
            ControlsBottomMiddle={() => <Button.Group>
                <Button
                    size={"md"}
                    variant={"subtle"}
                    onClick={() => {
                        setSelectMonth(true);
                        monthsOf.monthsOf(weeksOf.weeks.date);
                    }}
                    leftSection={<IconCalendarSearch/>}
                >
                    <DateInline date={weeksOf.weeks.date} options={{month: "long"}}/>
                </Button>
                <Button
                    size={"md"}
                    variant={"subtle"}
                    onClick={() => {
                        setSelectYear(true);
                        yearsOf.yearsOf(weeksOf.weeks.date);
                    }}
                    leftSection={<IconCalendarSearch/>}
                >
                    <DateInline date={weeksOf.weeks.date} options={{year: "numeric"}}/>
                </Button>
            </Button.Group>}
            {...props}
        >
            {selectMonth && <Overlay
                color={"#FFF"}
                backgroundOpacity={1}
            >
                <Months<TEventSchema>
                    onClick={({month: {month}}) => {
                        const weeks = weeksOf.weeksOf(month);
                        onChange?.({weeks});
                        setSelectMonth(false);
                    }}
                    ControlsBottomMiddle={() => <ActionIcon
                        variant={"subtle"}
                        onClick={() => setSelectMonth(false)}
                        c={"gray"}
                    >
                        <IconX/>
                    </ActionIcon>}
                />
            </Overlay>}
            {selectYear && <Overlay
                color={"#FFF"}
                backgroundOpacity={1}
            >
                <Years<TEventSchema>
                    onClick={({year: {year}}) => {
                        const weeks = weeksOf.weeksOf(year);
                        onChange?.({weeks});
                        setSelectYear(false);
                    }}
                    ControlsBottomMiddle={() => <ActionIcon
                        variant={"subtle"}
                        onClick={() => setSelectYear(false)}
                        c={"gray"}
                    >
                        <IconX/>
                    </ActionIcon>}
                />
            </Overlay>}
        </Weeks>
    </Box>;
};
