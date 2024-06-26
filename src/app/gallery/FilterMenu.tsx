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
                    `group absolute left-0 top-[50px] z-10 flex flex-row p-[5px] ` +
                    `${filterMenuOpen ? 'bg-primary_dark ' : 'rounded-br-lg bg-primary'}`
                }
                onClick={(e) => {
                    e.preventDefault();
                    setFilterMenuOpen(!filterMenuOpen);
                }}
            >
                <FaSlidersH className={`${filterMenuOpen ? 'fill-primary' : 'fill-primary_dark '} h-[30px] w-[30px] p-0.5`} />
            </div>
            {filterMenuOpen === true && (
                <div className="absolute left-0 top-[50px] flex h-[40px] w-fit flex-row rounded-bl-lg md:rounded-bl-none md:rounded-tl-lg">
                    {THEME_FILTERS.map(([filter, Icon], i) => (
                        <div
                            key={i}
                            className={`group p-[5px] last:rounded-br-lg ${filter === theme ? 'bg-primary_dark' : 'bg-primary hover:bg-primary_dark'}`}
                            onClick={(e) => {
                                e.preventDefault();
                                setTheme(filter);
                            }}
                        >
                            <Icon
                                className={`h-[30px] w-[30px] ${filter === theme ? 'fill-primary' : 'fill-primary_dark group-hover:fill-primary'}`}
                            />
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
