import React from 'react';


import { fetch_pieces } from '../../../../lib/api_calls';

import styles from '../../../../styles/components/Gallery.module.scss'

import Piece from '../../../components/Piece'

import Tune from '@material-ui/icons/Tune';     // Filter Menu Toggle Button
import AcUnit from '@material-ui/icons/AcUnit'; // Snow
import Waves from '@material-ui/icons/Waves';   // Ocean
import Landscape from '@material-ui/icons/Landscape'; // Mountains
import LocationCity from '@material-ui/icons/LocationCity'; // City
import LocalFlorist from '@material-ui/icons/LocalFlorist'; // Flowers
import Portrait from '@material-ui/icons/Portrait'; // Portrait
import Exposure from '@material-ui/icons/Exposure'; // Black And White
import Block from '@material-ui/icons/Block'; // None
import FilterBAndW from '@material-ui/icons/FilterBAndW'; // Abstract

const theme_filters = [
    ['Ocean', <Waves className={styles.gallery_filter_icon} />], 
    ['Snow', <AcUnit className={styles.gallery_filter_icon} />], 
    ['Mountain', <Landscape className={styles.gallery_filter_icon} />], 
    ['Landscape', <LocalFlorist className={styles.gallery_filter_icon} />], 
    ['City', <LocationCity className={styles.gallery_filter_icon} />],
    ['Portrait', <Portrait className={styles.gallery_filter_icon} />],
    ['Black and White', <Exposure className={styles.gallery_filter_icon} />],
    ['Abstract', <FilterBAndW className={styles.gallery_filter_icon} />],
    ['None', <Block className={styles.gallery_filter_icon} />]
]

const baseURL = "https://jwsfineartpieces.s3.us-west-1.amazonaws.com";

const DEBUG = false;

const DEFAULT_PIECE_WIDTH = 250;
const INNER_MARGIN_WIDTH = 30;
const BORDER_MARGIN_WIDTH = 10;

class GalleryPage extends React.Component {
    constructor(props) {
        super(props);

        const piece_list = this.props.piece_list;

        console.log('Passed piece list:')
        console.log(piece_list)
        
        this.state = {
            loading: true,
            filter_menu_open: false,
            window_width: this.props.window_width,
            window_height: this.props.window_height,
            piece_list: piece_list,
            gallery_pieces: [],
            lowest_height: 0,
            theme: 'None'
        }

        this.log_debug_message = this.log_debug_message.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.update_pieces_with_theme = this.update_pieces_with_theme.bind(this);
        this.create_gallery = this.create_gallery.bind(this);
    }

    log_debug_message(message) {
        if (DEBUG) {
            console.log(message)
        }
    }

    async componentDidMount() {
        // Add event listener
        window.addEventListener("resize", this.handleResize);

        // Call handler right away so state gets updated with initial window size
        this.handleResize();
    }

    async componentWillUnmount() {
        window.removeEventListener("resize", this.handleResize);
    }

    handleResize() {
        // Set window width/height to state
        console.log(`Width: ${window.innerWidth} | Height: ${window.innerHeight}`)
        this.setState({
          window_width: window.innerWidth,
          window_height: window.innerHeight,
        }, async () => { this.create_gallery(this.state.piece_list, this.state.theme) });
    }

    async create_gallery(piece_list, theme) {
        const piece_list_length = piece_list.length

        console.log('Component mounted.  Creating gallery...')     
        console.log(`Passed Window Size: ${this.state.window_width} | ${this.state.window_height}`)

        var gallery_pieces = [];
        var column_bottom_list = [];
        var lowest_height = 0;
        
        if (this.state.window_width != undefined && this.state.window_height != undefined) {
            var piece_width = DEFAULT_PIECE_WIDTH;
            if (this.state.window_width < 500 + 40 + 60 + 30) {
                piece_width = (this.state.window_width - 40 - 60 - 20) / 2;
            }
            this.log_debug_message(`PIECE WIDTH: ${piece_width}`)
          
            var max_columns = Math.trunc(this.state.window_width / (piece_width + (BORDER_MARGIN_WIDTH * 2) + INNER_MARGIN_WIDTH));
            this.log_debug_message(`COLUMNS: ${max_columns}`);
          
            var gallery_width = ((piece_width + (BORDER_MARGIN_WIDTH * 2)) * max_columns) + (10 * max_columns);
            if (max_columns < 3) gallery_width -= 20;
            
            var leftover_width = this.state.window_width - gallery_width;
            this.log_debug_message(`GALLERY WIDTH: ${gallery_width} | LEFTOVER: ${leftover_width}`);
          
            var margin = leftover_width / 2;
            this.log_debug_message(`LEFT MARGIN: ${margin} | MAIN: ${gallery_width} | RIGHT MARGIN: ${this.state.window_width - gallery_width - margin}`)
            
            var [cur_x, cur_y] = [margin, INNER_MARGIN_WIDTH];
            var [row, col] = [0, 0];
          
            var row_starting_height = INNER_MARGIN_WIDTH;
            var skip_col = false;
    
            console.log(`getServerSideProps piece_list length: ${piece_list_length} | Data (Next Line):`)
            console.log(piece_list)
            
            if (piece_list != null && piece_list.length > 0) {
                this.log_debug_message(`PIECE LIST LENGTH: ${piece_list_length}`)
          
                var i = 0; var real_i = 0;
                while (i < piece_list_length) {
                    var current_piece_json =  piece_list[i];
                    
                    var piece_theme     = current_piece_json['theme'];
                    console.log(`Current piece theme: ${piece_theme} | State theme: ${theme}`)
                    if ((theme != 'None') && (piece_theme !== undefined) && (!piece_theme.includes(theme))) {
                        console.log('Skipping piece as it does not match theme')
                        i += 1;
                        continue;
                    }
          
                    var o_id            = current_piece_json['o_id'];
                    var class_name      = current_piece_json['class_name'];
                    var image_path      = current_piece_json['image_path'];
                    var title           = current_piece_json['title'];
                    var description     = current_piece_json['description'];
                    var sold            = current_piece_json['sold'];
                    var available       = current_piece_json['available'];
                    var [width, height] = [current_piece_json['width'], current_piece_json['height']];
          
                    this.log_debug_message(`Width: ${width} | Height: ${height}`);
                    
                    var [scaled_width, scaled_height] = [piece_width, height];
                    scaled_height = (piece_width / width) * height;
          
                    this.log_debug_message(`Scaled Width: ${scaled_width} | Scaled Height: ${scaled_height}`);
          
                    real_i = (row * max_columns) + col;
                    var index = real_i % max_columns;
                    this.log_debug_message(`CURRENT INDEX: ${index} | COL: ${col} | ROW: ${row}`);
                    
                    this.log_debug_message(column_bottom_list);
                    this.log_debug_message(`LAST COLUMN BOTTOM: ${column_bottom_list[index]}`);
          
                    if (row > 0) cur_y = column_bottom_list[index];
                    else         column_bottom_list.push(INNER_MARGIN_WIDTH);
          
                    if (col == 0) {
                        row_starting_height = column_bottom_list[index] + INNER_MARGIN_WIDTH;
          
                        if (row_starting_height > column_bottom_list[index + 1] + INNER_MARGIN_WIDTH) {
                            skip_col = true;
                        }
                        else {
                            skip_col = false;
                        }
                    }
                    else {
                        if (cur_y > row_starting_height) {
                            this.log_debug_message("Y from last row intercepts current row.  Skipping column...");
                            skip_col = true;
          
                        }
                        else skip_col = false;
                    }
          
                    if (skip_col == true) {
                        if (col < max_columns - 1) {
                            col += 1;
                            cur_x += piece_width + INNER_MARGIN_WIDTH;
                        }
                        else {
                            [row, col] = [(row + 1), 0];
                            [cur_x, cur_y] = [margin, 0];
                        }
                    }
                    else if (skip_col == false) {
                        this.log_debug_message(`Current X: ${cur_x} | Current Y: ${cur_y}`);
          
                        column_bottom_list[index] = column_bottom_list[index] + scaled_height + INNER_MARGIN_WIDTH;
                        this.log_debug_message(`CURRENT BOTTOM (${index}): ${column_bottom_list[index]}` );
          
                        var dimensions = [cur_x, cur_y, scaled_width, scaled_height];
                        //console.log(`Dimensions: ${dimensions}`)
          
                        gallery_pieces.push(<Piece key={i} id={`piece-${i}`} o_id={o_id}
                                          className={class_name} 
                                          image_path={image_path}
                                          dimensions={dimensions}
                                          title={title} 
                                          description={description}
                                          sold={sold}
                                          available={available}/>);
                        
                        this.log_debug_message(`CUR COL: ${col} | MAX COL: ${max_columns}`)
                        if ( col < max_columns - 1 ) {
                            cur_x += scaled_width + INNER_MARGIN_WIDTH;
                            col += 1;
                        }
                        else {
                            [row, col] = [(row + 1), 0];
                            [cur_x, cur_y] = [margin, 0];
          
                            this.log_debug_message('####################################################################');
                            this.log_debug_message("GOING TO NEXT ROW");
                        }
          
                        i += 1;
                    } 
                    this.log_debug_message('--------------------------------------------------------------------');
                }
    
                for (var i = 0; i < column_bottom_list.length; i++) {
                    if (column_bottom_list[i] > lowest_height) lowest_height = column_bottom_list[i];
                }
                if (this.state.window_width < 600) lowest_height = lowest_height + 60;
            }
            else {
                console.log("Screenshot list length = 0");
            }
        }
        this.setState({piece_list: piece_list, gallery_pieces: gallery_pieces, lowest_height: lowest_height, theme: theme})
    }

    async update_pieces_with_theme(theme) {
        
        this.create_gallery(this.state.piece_list, theme)
    }

    render() {
        var filter_menu_array = [];
        for (var i = 0; i < theme_filters.length; i++) {
            let filter = theme_filters[i][0];
            let icon = theme_filters[i][1];
            filter_menu_array.push((
                <div className={(filter == this.state.theme) ? styles.gallery_filter_icon_container_selected : styles.gallery_filter_icon_container} onClick={(e) => { e.preventDefault(); this.update_pieces_with_theme(filter) }}>
                    {icon}
                </div>
            ))
        }

        const page_layout = (
            <div className={styles.gallery_inner_container}>
                <div className={(this.state.filter_menu_open) ? styles.gallery_filter_menu_toggle_open : styles.gallery_filter_menu_toggle} onClick={(e) => { e.preventDefault(); this.setState({filter_menu_open: !this.state.filter_menu_open}) }}>
                    <Tune className={`${styles.gallery_filter_menu_toggle_icon}`} />
                </div>
                {(this.state.filter_menu_open == true) ? (
                    <div className={styles.gallery_filter_menu} >
                        { filter_menu_array }
                    </div>
                ) : (  null )}

                <div className={styles.gallery_body} style={{height: this.state.lowest_height}}>
                    {this.state.gallery_pieces}
                </div>
            </div>
        )
        return page_layout
    }
}

export default GalleryPage;
