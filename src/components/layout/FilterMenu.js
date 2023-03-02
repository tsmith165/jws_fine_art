import React  from 'react';

import { Tooltip } from 'react-tooltip'

import filter_menu_styles from "@/styles/layout/FilterMenu.module.scss"

// Filter Menu Icons
import Tune from '@mui/icons-material/Tune';     // Filter Menu Toggle Button
import AcUnit from '@mui/icons-material/AcUnit'; // Snow
import Waves from '@mui/icons-material/Waves';   // Ocean
import Landscape from '@mui/icons-material/Landscape'; // Mountains
import LocationCity from '@mui/icons-material/LocationCity'; // City
import LocalFlorist from '@mui/icons-material/LocalFlorist'; // Flowers
import Portrait from '@mui/icons-material/Portrait'; // Portrait
import Exposure from '@mui/icons-material/Exposure'; // Black And White
import Block from '@mui/icons-material/Block'; // None
import FilterBAndW from '@mui/icons-material/FilterBAndW'; // Abstract
import ShoppingCart from '@mui/icons-material/ShoppingCart'; // Abstract

const THEME_FILTERS = [
    ['Water', <Waves className={filter_menu_styles.filter_icon} />], 
    ['Snow', <AcUnit className={filter_menu_styles.filter_icon} />], 
    ['Mountain', <Landscape className={filter_menu_styles.filter_icon} />], 
    ['Landscape', <LocalFlorist className={filter_menu_styles.filter_icon} />], 
    ['City', <LocationCity className={filter_menu_styles.filter_icon} />],
    ['Portrait', <Portrait className={filter_menu_styles.filter_icon} />],
    ['Black and White', <Exposure className={filter_menu_styles.filter_icon} />],
    ['Abstract', <FilterBAndW className={filter_menu_styles.filter_icon} />],
    ['Available', <ShoppingCart className={filter_menu_styles.filter_icon} />],
    ['None', <Block className={filter_menu_styles.filter_icon} />]
]

class FilterMenu extends React.Component {
    constructor(props) {
        super(props);
    }

    async componentDidMount() { }

    render() {
        console.log(`Rendering Filter Menu with app_state Theme: ${this.props.app_state.theme} | Filter Menu Open: ${this.props.app_state.filter_menu_open}`)

        var filter_menu_array = [];
        for (var i = 0; i < THEME_FILTERS.length; i++) {
            let filter = THEME_FILTERS[i][0];
            let icon = THEME_FILTERS[i][1];
            filter_menu_array.push((
                <div className={(filter == this.props.app_state.theme) ? `${filter_menu_styles.filter_icon_container_selected} ${filter_menu_styles.filter_icon_container}` : filter_menu_styles.filter_icon_container} 
                    id={filter}
                    data-tooltip-content={`${filter}`}
                    onClick={(e) => { e.preventDefault(); this.props.app_set_state({...this.props.app_state, theme: filter}) }}
                >
                    {icon}
                    <Tooltip anchorId={filter} />
                </div>
            ))
        }

        return (
            <>
                <div className={(this.props.app_state.filter_menu_open == false) ? filter_menu_styles.filter_menu_toggle : `${filter_menu_styles.filter_menu_toggle} ${filter_menu_styles.filter_menu_toggle_open}` }>
                    {(this.props.app_state.filter_menu_open == true) ? ( null ) : (
                        <div className={filter_menu_styles.filter_menu_tooltip} onClick={(e) => { e.preventDefault(); this.props.app_set_state({...this.props.app_state, filter_menu_open: !this.props.app_state.filter_menu_open}) }}>
                            Filters
                        </div>
                    )}
                    <Tune className={filter_menu_styles.filter_menu_toggle_icon} onClick={(e) => { e.preventDefault(); this.props.app_set_state({...this.props.app_state, filter_menu_open: !this.props.app_state.filter_menu_open}) }}/>
                </div>
                {(this.props.app_state.filter_menu_open == false) ? ( null ) : (
                    <div className={filter_menu_styles.filter_menu} >
                        { filter_menu_array }
                    </div>
                )}
            </>
        )
    }
}

export default FilterMenu;