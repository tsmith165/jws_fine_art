import React from 'react';
import styles from '@/styles/forms/PieceSpecificationTable.module.scss';

const PieceSpecificationTable = ({ realWidth, realHeight, theme, framed, comments, type }) => {
    console.log('FRAMED: ' + framed);
    return (
        <div className={styles.piece_specification_table_wrapper}>
            <div className={styles.piece_specification_table_header}>Piece Specifications</div>
            <table className={styles.piece_specification_table}>
                <tbody>
                    {realWidth && realHeight && (
                        <tr>
                            <td>Dimensions</td>
                            <td>{`${realWidth}" x ${realHeight}"`}</td>
                        </tr>
                    )}
                    {type && (
                        <tr>
                            <td>Type</td>
                            <td>{type}</td>
                        </tr>
                    )}
                    {framed !== null && (
                        <tr>
                            <td>Framed</td>
                            <td>{framed == true ? 'Yes' : 'No'}</td>
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
