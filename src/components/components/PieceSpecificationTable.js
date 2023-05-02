import logger from "@/lib/logger";

import React from 'react';
import styles from '@/styles/components/PieceSpecificationTable.module.scss';

const PieceSpecificationTable = ({ realWidth, realHeight, framed, comments, type, with_header }) => {
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
                            <td>{framed == true ? 'Yes' : 'No'}</td>
                        </tr>
                    )}
                    {type && (
                        <tr>
                            <td>Type</td>
                            <td>{type}</td>
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
