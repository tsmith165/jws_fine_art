import React from 'react';

import 'react-tooltip/dist/react-tooltip.css'

import styles from '../../../../styles/components/Gallery.module.scss'

import Piece from '../../../components/Piece'
import { isUndefined } from 'underscore';

const baseURL = "https://jwsfineartpieces.s3.us-west-1.amazonaws.com";

const DEBUG = false;

const DEFAULT_PIECE_WIDTH = 250;
const INNER_MARGIN_WIDTH = 30;
const BORDER_MARGIN_WIDTH = 10;

class GalleryPage extends React.Component {
    constructor(props) {
        super(props);
        const piece_list = this.props.piece_list;

        // console.log('Passed piece list:')
        // console.log(piece_list)
        
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

    async componentDidUpdate(prevProps, prevState) {
        if (prevProps.app_state.theme !== this.props.app_state.theme) {
            this.create_gallery(this.state.piece_list, this.props.app_state.theme)
        }
    }

    handleResize() {
        // Set window width/height to state
        console.log(`Window Width: ${window.innerWidth} | Height: ${window.innerHeight}`)
        this.setState({
          window_width: window.innerWidth,
          window_height: window.innerHeight,
        }, async () => { this.create_gallery(this.state.piece_list, this.state.theme) });
    }

    async create_gallery(piece_list, theme) {
        const piece_list_length = piece_list.length

        if (piece_list == null || piece_list.length < 1) {
            console.error(`Cannot create gallery, passed piece_list invalid.  Width: ${(this.state.window_width == undefined) ? null : this.state.window_width}`)
        }
        this.log_debug_message(`Passed piece_list length: ${piece_list_length}`)

        if (this.state.window_width == undefined) {
            console.error(`Cannot create gallery, state.window_width invalid.  Value: ${(this.state.window_width == undefined) ? null : this.state.window_width}`)
        }
        if (this.state.window_height == undefined) {
            console.error(`Cannot create gallery, state.window_height invalid.  Value: ${(this.state.window_width == undefined) ? null : this.state.window_width}`)
        }
        this.log_debug_message(`Window Width: ${this.state.window_width} | Window height: ${this.state.window_height}`)

        var gallery_pieces = [];
        var column_bottom_list = [];
        var lowest_height = 0;
        
        var piece_width = DEFAULT_PIECE_WIDTH;
        if (this.state.window_width < 500 + 40 + 60 + 30) {
            piece_width = (this.state.window_width - 40 - 60 - 20) / 2;
        }
        this.log_debug_message(`Using Piece Width: ${piece_width}`)
        
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

        console.log(`Creating gallery with piece_list length: ${piece_list_length} | Data (Next Line):`)
        console.log(piece_list)
        
        var i = 0; var real_i = 0;
        while (i < piece_list_length) {
            var current_piece_json =  piece_list[i];
            // console.log(current_piece_json)
            
            var piece_theme = (current_piece_json['theme'] !== undefined ) ? ((current_piece_json['theme'] != null) ? current_piece_json['theme'] : 'None') : 'None';
            var piece_sold = (current_piece_json['sold'] !== undefined ) ? ((current_piece_json['sold'] != null) ? current_piece_json['sold'] : false) : false;
            var piece_available = (current_piece_json['available'] !== undefined ) ? ((current_piece_json['available'] != null) ? current_piece_json['available'] : false) : false;
            // console.log(`Current piece theme: ${piece_theme} | State theme: ${theme}`)
            if (theme != 'None' && theme != undefined && theme != null) {
                if (theme == 'Available') {
                    if (piece_sold) {
                        console.log('Skipping piece as it is sold')
                        i += 1;
                        continue;
                    }
                    if (!piece_available) {
                        console.log('Skipping piece as it is not available')
                        i += 1;
                        continue;
                    }
                } else {
                    if ((piece_theme !== undefined) && (!piece_theme.includes(this.props.app_state.theme))) {
                        console.log('Skipping piece as it does not match theme')
                        i += 1;
                        continue;
                    }
                }
            }
    
            var o_id        = (current_piece_json['o_id'] !== undefined) ? current_piece_json['o_id'] : 'None';
            var class_name  = (current_piece_json['class_name'] !== undefined) ? current_piece_json['class_name'] : 'None';
            var image_path  = (current_piece_json['image_path'] !== undefined) ? current_piece_json['image_path'] : 'None';
            var title       = (current_piece_json['title'] !== undefined) ? current_piece_json['title'] : 'None';
            var description = (current_piece_json['description'] !== undefined) ? current_piece_json['description'] : 'None';
            var sold        = (current_piece_json['sold'] !== undefined) ? current_piece_json['sold'] : 'None';
            var available   = (current_piece_json['available'] !== undefined) ? current_piece_json['available'] : 'None';
            var [width, height] = (current_piece_json['width'] !== undefined && current_piece_json['height'] !== undefined) ? [current_piece_json['width'], current_piece_json['height']] : 'None';
    
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
                skip_col = (row_starting_height > column_bottom_list[index + 1] + INNER_MARGIN_WIDTH) ? true : false;
            }
            else {
                skip_col = (cur_y > row_starting_height) ? true : false
                if (skip_col) { this.log_debug_message("Y from last row intercepts current row.  Skipping column..."); }
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

        this.setState({piece_list: piece_list, gallery_pieces: gallery_pieces, lowest_height: lowest_height, theme: theme })
        // this.setState({piece_list: piece_list, gallery_pieces: gallery_pieces, lowest_height: lowest_height, theme: theme, filter_menu_open: ((this.state.window_width < 800) ? false : this.state.filter_menu_open) })
    }

    async update_pieces_with_theme(theme) {
        
        this.create_gallery(this.state.piece_list, theme)
    }

    render() {
        // console.log(`Render gallery Filter menu open: ${this.props.app_state.filter_menu_open} | window width: ${this.state.window_width}`)

        const page_layout = (
            <div className={(this.state.window_width !== undefined && this.state.window_width < 800 && this.props.app_state.filter_menu_open == true) ? `${styles.gallery_container} ${styles.gallery_container_open}` : styles.gallery_container }>
                <div className={styles.gallery_main_container}>
                    <div className={styles.gallery_inner_container}>
                        <div className={styles.gallery_body} style={{height: this.state.lowest_height}}>
                            {this.state.gallery_pieces}
                        </div>
                    </div>
                </div>
            </div>
        )
        return page_layout
    }
}

export default GalleryPage;
