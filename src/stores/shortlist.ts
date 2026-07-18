'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ShortlistState = {
    ids: number[];
    toggle: (id: number) => void;
};

export const useShortlist = create<ShortlistState>()(
    persist(
        (set) => ({
            ids: [],
            toggle: (id) =>
                set((state) => ({
                    ids: state.ids.includes(id) ? state.ids.filter((item) => item !== id) : [...state.ids, id],
                })),
        }),
        { name: 'jws-artwork-shortlist' },
    ),
);
