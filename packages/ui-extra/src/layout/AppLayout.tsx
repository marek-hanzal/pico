"use client";

import {
    ActionIcon,
    AppShell,
    Box,
    LoadingOverlay
}                                 from "@mantine/core";
import {IconLogout}               from "@tabler/icons-react";
import {
    LocaleLink,
    useLocaleRouter
}                                 from "@use-pico/i18n";
import {useClearCache}            from "@use-pico/query";
import {
    BlockStore,
    Grid,
    Group
}                                 from "@use-pico/ui";
import {type IWithLogoutMutation} from "@use-pico/ui-extra";
import Image                      from "next/image";
import {
    type ComponentProps,
    type FC,
    type PropsWithChildren,
    type ReactNode,
    useEffect
}                                 from "react";

export namespace AppLayout {
    export interface Props extends PropsWithChildren {
        logo: ComponentProps<typeof Image>["src"];
        homeUrl?: string;
        publicUrl?: string;
        withLogoutMutation?: IWithLogoutMutation;
        /**
         * Center part of the layout (header)
         */
        center?: ReactNode;
        right?: ReactNode;
    }
}

/**
 * General layout used inside app when a user is logged-in.
 */
export const AppLayout: FC<AppLayout.Props> = (
    {
        logo,
        homeUrl = "/root",
        publicUrl = "/public",
        withLogoutMutation,
        center,
        right,
        children
    }) => {
    const clearCache = useClearCache();
    const logout = withLogoutMutation?.useMutation();
    const router = useLocaleRouter();
    const block = BlockStore.use$();
    useEffect(() => {
        block?.unblock();
    }, []);
    return <AppShell>
        <Box>
            <LoadingOverlay
                visible={block?.isBlock || false}
            />
            <Grid
                align={"center"}
                px={"md"}
                pt={"xs"}
            >
                <Grid.Col span={"content"}>
                    <LocaleLink
                        href={homeUrl}
                        style={{
                            display: "block",
                        }}
                    >
                        <Image
                            priority={true}
                            height={32}
                            alt={"logo"}
                            src={logo}
                        />
                    </LocaleLink>
                </Grid.Col>
                <Grid.Col span={"auto"} m={0}>
                    {center}
                </Grid.Col>
                <Grid.Col span={"content"}>
                    <Group gap={"xs"}>
                        {right}
                        {logout && <ActionIcon
                            variant={"white"}
                            size={"xl"}
                            onClick={() => {
                                clearCache();
                                block?.block();
                                logout.mutate({}, {
                                    onSuccess: () => router.push({
                                        href: publicUrl,
                                    }),
                                });
                            }}
                        >
                            <IconLogout/>
                        </ActionIcon>}
                    </Group>
                </Grid.Col>
            </Grid>
        </Box>
        <AppShell.Main>
            {children}
        </AppShell.Main>
    </AppShell>;
};
