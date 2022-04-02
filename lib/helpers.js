

function get_piece_id_from_path_o_id(PathOID, pieces) {
    for (var i=0; i < pieces.length; i++) {
        if (pieces[i]['o_id'].toString() == PathOID.toString()) {
            return i
        }
    }
}

export {
    get_piece_id_from_path_o_id
}