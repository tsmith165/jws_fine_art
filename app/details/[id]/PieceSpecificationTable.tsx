import React from 'react';

interface PieceSpecificationTableProps {
    realWidth?: string;
    realHeight?: string;
    framed?: boolean | string;
    comments?: string;
    piece_type?: string;
    with_header?: boolean;
}

const PieceSpecificationTable: React.FC<PieceSpecificationTableProps> = ({
    realWidth,
    realHeight,
    framed,
    comments,
    piece_type,
    with_header = false,
}) => {
    console.log('Commments: ', comments);
    return (
        <div className="w-fit rounded-md">
            {with_header && (
                <div className="rounded-t-md bg-primary_dark p-2 text-center font-alegrya text-xl text-secondary_light">
                    Piece Specifications
                </div>
            )}
            <table className={`m-0 w-fit border-separate border-spacing-0 rounded-md border-2 border-primary_dark bg-primary`}>
                <tbody className="text-primary">
                    {realWidth && parseInt(realWidth) > 0 && realHeight && parseInt(realHeight) > 0 && (
                        <tr className="group hover:bg-secondary_dark">
                            <td className="border-b-2 border-primary_dark p-1.5 text-end text-secondary_dark group-hover:text-primary">
                                Size:
                            </td>
                            <td className="border-b-2 border-primary_dark p-1.5 text-secondary_dark group-hover:text-primary">
                                {`${realWidth}" x ${realHeight}"`}
                            </td>
                        </tr>
                    )}
                    {framed !== null && (
                        <tr className="group hover:bg-secondary_dark">
                            <td className="border-b-2 border-primary_dark p-1.5 text-end text-secondary_dark group-hover:text-primary">
                                Framed:
                            </td>
                            <td className="border-b-2 border-primary_dark p-1.5 text-secondary_dark group-hover:text-primary ">
                                {framed || framed?.toString().toLowerCase() === 'true' ? 'Yes' : 'No'}
                            </td>
                        </tr>
                    )}
                    {piece_type && (
                        <tr className="group hover:bg-secondary_dark">
                            <td className="border-b-2 border-primary_dark p-1.5 text-end text-secondary_dark group-hover:text-primary">
                                Type:
                            </td>
                            <td className="border-b-2 border-primary_dark p-1.5 text-secondary_dark group-hover:text-primary">
                                {piece_type}
                            </td>
                        </tr>
                    )}
                    {comments && (
                        <tr className="group hover:bg-secondary_dark">
                            <td className="border-b-2 border-primary_dark p-1.5 text-end text-secondary_dark group-hover:text-primary">
                                Comments:
                            </td>
                            <td className="whitespace-pre-wrap border-b-2 border-primary_dark p-1.5 text-secondary_dark group-hover:text-primary">
                                {comments}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default PieceSpecificationTable;
