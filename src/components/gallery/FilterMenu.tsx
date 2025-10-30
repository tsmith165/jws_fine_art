import React from 'react';
import { Tooltip } from 'react-tooltip';
import { FaSlidersH, FaSnowflake, FaMountain, FaTree, FaCity, FaPortrait, FaShoppingCart, FaBan } from 'react-icons/fa';
import { FaCircleHalfStroke } from 'react-icons/fa6';
import useGalleryStore from '@/stores/gallery_store';

const THEME_FILTERS: [string, string, React.ComponentType<{ className?: string }>][] = [
    ['Snow', 'snow', FaSnowflake],
    ['Mountain', 'mountain', FaMountain],
    ['Landscape', 'landscape', FaTree],
    ['City', 'city', FaCity],
    ['Portrait', 'portrait', FaPortrait],
    ['Black and White', 'black_and_white', FaCircleHalfStroke],
    ['Available', 'available', FaShoppingCart],
    ['None', 'none', FaBan],
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
                    `group absolute bottom-0 right-0 z-10 flex flex-row p-[5px] ` +
                    `${filterMenuOpen ? 'bg-primary_dark ' : 'rounded-tl-lg bg-primary'}`
                }
                onClick={(e) => {
                    e.preventDefault();
                    setFilterMenuOpen(!filterMenuOpen);
                }}
            >
                <FaSlidersH className={`${filterMenuOpen ? 'fill-primary' : 'fill-primary_dark '} h-[30px] w-[30px] p-0.5`} />
            </div>
            {filterMenuOpen === true && (
                <div className="absolute bottom-0 right-[40px] flex h-[40px] w-fit flex-row rounded-tl-lg md:rounded-bl-none md:rounded-tl-lg">
                    {THEME_FILTERS.reverse().map(([filter, filter_class, Icon], i) => (
                        <div
                            key={i}
                            className={`group p-[5px] first:rounded-tl-lg ${filter === theme ? 'bg-primary_dark' : 'bg-primary hover:bg-primary_dark'}`}
                            onClick={(e) => {
                                e.preventDefault();
                                setTheme(filter);
                            }}
                        >
                            <Icon
                                className={`h-[30px] w-[30px] filter-icon-${filter_class} ${
                                    filter === theme ? 'fill-primary' : 'fill-primary_dark group-hover:fill-primary'
                                }`}
                            />
                        </div>
                    ))}
                    {THEME_FILTERS.reverse().map(([filter, filter_class, icon], i) => (
                        <Tooltip key={i} anchorSelect={`.filter-icon-${filter_class}`} place="top">
                            {filter}
                        </Tooltip>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FilterMenu;
