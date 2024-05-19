import React from 'react';
import { Tooltip } from 'react-tooltip';
import { FaSlidersH, FaSnowflake, FaMountain, FaTree, FaCity, FaPortrait, FaShoppingCart, FaBan } from 'react-icons/fa';
import { FaCircleHalfStroke } from 'react-icons/fa6';
import useGalleryStore from '@/stores/gallery_store';

const THEME_FILTERS: [string, React.ComponentType<{ className?: string }>][] = [
    ['Snow', FaSnowflake],
    ['Mountain', FaMountain],
    ['Landscape', FaTree],
    ['City', FaCity],
    ['Portrait', FaPortrait],
    ['Black and White', FaCircleHalfStroke],
    ['Available', FaShoppingCart],
    ['None', FaBan],
];

const FilterMenu: React.FC = () => {
    const { theme, filterMenuOpen, setTheme, setFilterMenuOpen } = useGalleryStore((state) => ({
        theme: state.theme,
        filterMenuOpen: state.filterMenuOpen,
        setTheme: state.setTheme,
        setFilterMenuOpen: state.setFilterMenuOpen,
    }));

    return (
        <div onMouseEnter={() => setFilterMenuOpen(true)} onMouseLeave={() => setFilterMenuOpen(false)}>
            <div
                className={
                    `absolute right-[120px] top-[40px] z-10 flex flex-row overflow-visible bg-secondary_dark p-[5px] text-secondary_light ` +
                    `hover:bg-secondary_light hover:text-secondary_dark ` +
                    `${filterMenuOpen ? 'rounded-t-lg bg-secondary_light text-secondary_dark md:rounded-t-none md:rounded-tr-lg' : 'rounded-t-lg'}`
                }
                onClick={(e) => {
                    e.preventDefault();
                    setFilterMenuOpen(!filterMenuOpen);
                }}
            >
                <FaSlidersH className="h-[30px] w-[30px]" />
            </div>
            {filterMenuOpen === true && (
                <div className="absolute right-0 top-[80px] flex h-[40px] w-fit flex-row md:right-[160px] md:top-[40px]">
                    {THEME_FILTERS.map(([filter, Icon], i) => (
                        <div
                            key={i}
                            className={`p-[5px] ${filter === theme ? 'bg-secondary' : 'bg-secondary_light'} ${i === 0 ? 'rounded-bl-lg md:rounded-bl-none md:rounded-tl-lg' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                setTheme(filter);
                            }}
                        >
                            <Icon className={`h-[30px] w-[30px] ${filter === theme ? 'fill-primary' : 'fill-primary_dark'}`} />
                        </div>
                    ))}
                    {THEME_FILTERS.map(([filter, icon], i) => (
                        <Tooltip key={i} anchorSelect={`.filter-icon-${filter}`} place="top">
                            {filter}
                        </Tooltip>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FilterMenu;
