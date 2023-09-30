import logger from "@/lib/logger";

import React from 'react';
import styles from '@/styles/components/PieceSpecificationTable.module.scss';

const PieceSpecificationTable = ({ realWidth, realHeight, framed, comments, piece_type, with_header }) => {
    console.log(`PieceSpecificationTable TYPE: ${piece_type}`)
    return (
        <div className={styles.piece_specification_table_wrapper}>
            {with_header == true ? (
                <div className={styles.piece_specification_table_header}>Piece Specifications</div>
            ) : null}
            <table
                className={
                    with_header == true ? styles.piece_specification_table : styles.piece_specification_table_no_head
                }
            >
                <tbody>
                    {realWidth && realHeight && (
                        <tr>
                            <td>Dimensions</td>
                            <td>{`${realWidth}" x ${realHeight}"`}</td>
                        </tr>
                    )}
                    {framed !== null && (
                        <tr>
                            <td>Framed</td>
                            <td>{(framed == true || framed.toString().toLowerCase() == 'true') ? 'Yes' : 'No'}</td>
                        </tr>
                    )}
                    {piece_type && (
                        <tr>
                            <td>Type</td>
                            <td>{piece_type}</td>
                        </tr>
                    )}
                    {comments && (
                        <tr>
                            <td>Comments</td>
                            <td>{comments}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default PieceSpecificationTable;
