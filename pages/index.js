import { signIn, signOut, useSession } from "next-auth/react"

import { prisma } from '../lib/prisma'

import PageLayout from '../src/components/layout/PageLayout'
import Piece from '../src/components/Piece'

import styles from '../styles/Home.module.scss'
import useWindowSize from '../lib/useWindowSize'

export default function Home({piece_list}) {
    const [session, loading] = useSession()

    var window_size = useWindowSize()

    if (session == true) {
        console.log("Session returned true")
        var pieces = get_pieces(pieces, window_size);
    
        return (
            <PageLayout>
            <div className={styles.gallery_container}>
                <div className={styles.gallery_body} style={{height: lowest_height}}>
                {pieces}
                </div>
            </div>
            </PageLayout>
        )
    } else {
        console.log("Session returned false")

        return (
            <PageLayout>
                <h1>Sign In</h1>
                <button onClick={() => signIn()}>Sign In</button>
            </PageLayout>
        )
    }
}

function get_pieces(piece_list, window_size) {
    console.log("CURRENT PIECE LIST (NEXT LINE):")
    console.log(piece_list);

    const debug = true;
    const stop_where_debugged_at = true;

    var pieces = [];
    var piece_width = 250;

    var [window_width, window_height] = [window_size['width'], window_size['height']];

    if (debug) console.log(`WINDOW WIDTH: ${window_width} | HEIGHT: ${window_height}`);

    var inner_margin = 30;
    var border_margin = 10;

    if (window_width < 500 + 40 + 60 + 30) {
        piece_width = (window_width - 40 - 60 - 20) / 2;
        if (debug) console.log(`PIECE WIDTH: ${piece_width}`)
    }

    var max_columns = Math.trunc(window_width / (piece_width + (border_margin * 2) + inner_margin));
    if (debug) console.log(`COLUMNS: ${max_columns}`);

    var gallery_width = ((piece_width + (border_margin * 2)) * max_columns) + (10 * max_columns);
    if (max_columns < 3) gallery_width -= 20;
    
    var leftover_width = window_width - gallery_width;
    if (debug) console.log(`GALLERY WIDTH: ${gallery_width} | LEFTOVER: ${leftover_width}`);

    //var leftover_width = window_width % (piece_width + (border_margin * 2) + 30);
    var margin = leftover_width / 2;

    if (debug) console.log(`LEFT MARGIN: ${margin} | MAIN: ${gallery_width} | RIGHT MARGIN: ${window_width - gallery_width -margin}`)
    
    var [cur_x, cur_y] = [margin, inner_margin];
    var [row, col] = [0, 0];

    var row_starting_height = inner_margin;
    var skip_col = false;

    var column_bottom_list = [];

    if (piece_list != null && piece_list.length > 0) {
        var piece_list_length = piece_list.length;

        if (debug) console.log(`PIECE LIST LENGTH: ${piece_list_length}`)

        var i = 0; var real_i = 0;
        var current_piece = 0;
        while (i < piece_list_length) {
            var current_piece_json =  piece_list[i];

            var o_id            = current_piece_json['o_id'];
            var class_name      = current_piece_json['class_name'];
            var image_path      = current_piece_json['image_path'];
            var title           = current_piece_json['title'];
            var description     = current_piece_json['description'];
            var sold            = current_piece_json['sold'];
            var [width, height] = [current_piece_json['width'], current_piece_json['height']];

            if (debug) console.log(`Width: ${width} | Height: ${height}`);
            
            var [scaled_width, scaled_height] = [piece_width, height];
            scaled_height = (piece_width / width) * height;

            if (debug) console.log(`Scaled Width: ${scaled_width} | Scaled Height: ${scaled_height}`);

            real_i = (row * max_columns) + col;
            var index = real_i % max_columns;
            if (debug) console.log(`CURRENT INDEX: ${index} | COL: ${col} | ROW: ${row}`);
            
            if (debug) console.log(column_bottom_list);
            if (debug) console.log(`LAST COLUMN BOTTOM: ${column_bottom_list[index]}`);

            if (row > 0) cur_y = column_bottom_list[index];
            else         column_bottom_list.push(inner_margin);

            if (col == 0) {
                row_starting_height = column_bottom_list[index] + inner_margin;

                if (row_starting_height > column_bottom_list[index + 1] + inner_margin) {
                    skip_col = true;
                }
                else {
                    skip_col = false;
                }
            }
            else {
                if (cur_y > row_starting_height) {
                    if (debug) console.log("Y from last row intercepts current row.  Skipping column...");
                    skip_col = true;

                }
                else skip_col = false;
            }

            if (skip_col == true) {
                if (col < max_columns - 1) {
                    col += 1;
                    cur_x += piece_width + inner_margin;
                }
                else {
                    [row, col] = [(row + 1), 0];
                    [cur_x, cur_y] = [margin, 0];
                }
            }
            else if (skip_col == false) {
                if (debug) console.log(`Current X: ${cur_x} | Current Y: ${cur_y}`);

                column_bottom_list[index] = column_bottom_list[index] + scaled_height + inner_margin;
                if (debug) console.log(`CURRENT BOTTOM (${index}): ${column_bottom_list[index]}` );

                var dimensions = [cur_x, cur_y, scaled_width, scaled_height];

                pieces.push(<Piece key={i} id={`piece-${i}`} o_id={o_id}
                                    myClick={piece_clicked}
                                    className={class_name} 
                                    image_path={image_path}
                                    dimensions={dimensions}
                                    title={title} 
                                    description={description}
                                    sold={sold}/>);
                
                if (debug) console.log(`CUR COL: ${col} | MAX COL: ${max_columns}`)
                if ( col < max_columns - 1 ) {
                    cur_x += scaled_width + inner_margin;
                    col += 1;
                }
                else {
                    [row, col] = [(row + 1), 0];
                    [cur_x, cur_y] = [margin, 0];

                    if (debug) console.log('####################################################################');
                    if (debug) console.log("GOING TO NEXT ROW");
                }

                i += 1;
                current_piece += 1;
            } 
            if (debug) console.log('--------------------------------------------------------------------');
        }
    }
    else {
        console.log("Screenshot list length = 0");
    }

    var lowest_height = 0;
    for (i = 0; i < column_bottom_list.length; i++) {
        if (column_bottom_list[i] > lowest_height) lowest_height = column_bottom_list[i];
    }
    if (debug) console.log("Lowest: " + lowest_height);

    //pieces.push(<div id="space_" style={{position: 'absolute', height: '10px', width: '100%', top: lowest_height, left: 0}}></div>)

    if (window_width < 600) lowest_height = lowest_height + 60;
}

function piece_clicked(e) {
  var clicked_id = e.currentTarget.id.replace("piece-", "")

  console.log("-------------------------------------------------");
  console.log("Piece Clicked...");
  console.log(`Piece ID: ${clicked_id}`);
  console.log("-------------------------------------------------");

  const el = document.getElementById('gallery-container');
  var scroll_position = el.scrollTop;
  console.log("SCROLL POSITION: " + scroll_position);

  this.props.app_set_state({current_piece: clicked_id, current_page: 'details', scroll_position: scroll_position});
}

async function fetchPieces() {
  console.log(`Fetching pieces with prisma`)
  const piece_list = await prisma.piece.findMany({
      orderBy: {
          o_id: 'desc',
      },
  })

  return piece_list
}

export const getStaticProps = async (context) => {
  console.log("Getting Static Props")
  const piece_list = await fetchPieces()

  //console.log(context)
  return { 
      props: {
          "piece_list": piece_list
      },
      revalidate: 60
  }
}
