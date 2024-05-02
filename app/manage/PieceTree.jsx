import Link from 'next/link';
import Image from 'next/image';

import logger from '@/lib/logger';
import PROJECT_CONSTANTS from '@/lib/constants';
import styles from '@/styles/pages/Manage.module.scss';
import { change_order, delete_piece } from '@/lib/api_calls';

import { IoIosArrowForward } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";
import { FaEdit } from "react-icons/fa";

const PieceTree = ({ piece_tree_data, refresh_data }) => {
    
    const handleOrderChange = async (curr_id_list, next_id_list) => {
        await change_order(curr_id_list, next_id_list);
        refresh_data();  // Refresh the piece list after changing the order
    };

    const handleDeletePiece = async (id) => {
        await delete_piece(id);
        refresh_data();  // Refresh the piece list after deleting
    };

    console.log('Generating Piece Tree - Data Next Line');
    console.log(piece_tree_data);

    const list_items = piece_tree_data.map((piece_data, i) => {
        const pieces_length = piece_tree_data.length;

        const curr_id = piece_data['id'];
        const last_id = (i + 1 > pieces_length - 1) ? piece_tree_data[0]['id'] : piece_tree_data[i + 1]['id'];
        const next_id = (i - 1 < 0) ? piece_tree_data[pieces_length - 1]['id'] : piece_tree_data[i - 1]['id'];

        const curr_o_id = piece_data['o_id'];
        const last_o_id = (i + 1 > pieces_length - 1) ? piece_tree_data[0]['o_id'] : piece_tree_data[i + 1]['o_id'];
        const next_o_id = (i - 1 < 0) ? piece_tree_data[pieces_length - 1]['o_id'] : piece_tree_data[i - 1]['o_id'];

        const next_id_list = [next_id, next_o_id];
        const last_id_list = [last_id, last_o_id];
        const curr_id_list = [curr_id, curr_o_id];

        const image_url = piece_data['image_path'].includes(PROJECT_CONSTANTS.AWS_BUCKET_URL) ? piece_data['image_path'] : `${PROJECT_CONSTANTS.AWS_BUCKET_URL}${piece_data['image_path']}`;

        return (
            <div key={curr_id} className={styles.tree_list_item}>
                <div className={styles.list_item_image_container}>
                    <Image className={styles.list_item_image} src={image_url} layout="fill" objectFit="contain" />
                </div>

                <div className={styles.list_item_stacked_container}> 
                    <div className={styles.stack_inner_container}>
                        <IoIosArrowForward className={`${styles.stacked_arrow} ${styles.stacked_up}`} onClick={(e) => { e.preventDefault(); handleOrderChange(curr_id_list, next_id_list); }} />
                        <IoIosArrowForward className={`${styles.stacked_arrow} ${styles.stacked_down}`} onClick={(e) => { e.preventDefault(); handleOrderChange(curr_id_list, last_id_list); }} />
                    </div>
                </div>

                <Link href={`/edit/${curr_id}`}>
                    <div className={styles.list_item_icon_container}>
                        <FaEdit className={`${styles.list_item_icon} ${styles.edit_button}`} />
                    </div>
                </Link>

                <div className={styles.list_item_icon_container}>
                    <MdDeleteForever className={`${styles.list_item_icon} ${styles.delete_button}`} onClick={(e) => { e.preventDefault(); handleDeletePiece(curr_id); }} />
                </div>

                <div className={`${styles.list_item_title_container}`}>
                    <b className={`${styles.list_item_title}`}>{piece_data['title']}</b>
                </div>
            </div>
        );
    });

    return (
        <div className={styles.piece_tree_body}>
            <div className={styles.tree_list_item_container}>
                {list_items}
            </div>
        </div>
    );
}

export default PieceTree;
