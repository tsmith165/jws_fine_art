import { create } from 'zustand';

interface GalleryStore {
    theme: string;
    filterMenuOpen: boolean;
    setTheme: (theme: string) => void;
    setFilterMenuOpen: (filterMenuOpen: boolean) => void;
}

const useGalleryStore = create<GalleryStore>((set) => ({
    theme: 'None',
    filterMenuOpen: false,
    setTheme: (theme: string) => set(() => ({ theme })),
    setFilterMenuOpen: (filterMenuOpen: boolean) => set(() => ({ filterMenuOpen })),
}));

export default useGalleryStore;
