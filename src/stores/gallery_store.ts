import { create } from 'zustand';
import { PiecesWithImages } from '@/db/schema';

import type { JSX } from "react";

interface GalleryStore {
    theme: string;
    filterMenuOpen: boolean;
    pieceList: PiecesWithImages[];
    galleryPieces: JSX.Element[];
    selectedPieceIndex: number | null;
    setTheme: (theme: string) => void;
    setFilterMenuOpen: (filterMenuOpen: boolean) => void;
    setPieceList: (pieceList: PiecesWithImages[]) => void;
    setGalleryPieces: (callback: (prevGalleryPieces: JSX.Element[]) => JSX.Element[]) => void;
    setSelectedPieceIndex: (index: number | null) => void;
}

const useGalleryStore = create<GalleryStore>((set) => ({
    theme: 'None',
    filterMenuOpen: false,
    pieceList: [],
    galleryPieces: [],
    selectedPieceIndex: null,
    setTheme: (theme: string) => set(() => ({ theme })),
    setFilterMenuOpen: (filterMenuOpen: boolean) => set(() => ({ filterMenuOpen })),
    setPieceList: (pieceList: PiecesWithImages[]) => set(() => ({ pieceList })),
    setGalleryPieces: (callback: (prevGalleryPieces: JSX.Element[]) => JSX.Element[]) =>
        set((state) => ({ galleryPieces: callback(state.galleryPieces) })),
    setSelectedPieceIndex: (index: number | null) => set(() => ({ selectedPieceIndex: index })),
}));

export default useGalleryStore;
