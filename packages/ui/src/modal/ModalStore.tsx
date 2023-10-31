"use client";

import {
    createStore,
    type IStore
} from "@use-pico/store";

export namespace ModalStore {
    export type StoreProps = IStore<{
        open(id: string): void;
        close(id: string): void;
        setOpen(id: string, isOpened: boolean): void;
        isOpen(id: string): boolean;
    }, {
        state: Map<string, boolean>;
    }>;
}

export const ModalStore = createStore<ModalStore.StoreProps>(values => (set, get) => ({
    open:    id => {
        set({
            state: get().state.set(id, true),
        });
    },
    close:   id => {
        set({
            state: get().state.set(id, false),
        });
    },
    setOpen: (id, isOpened) => {
        set({
            state: get().state.set(id, isOpened),
        });
    },
    isOpen:  id => get().state.get(id) || false,
    ...values,
}));
