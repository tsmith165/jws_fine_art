import styles from '@/styles/components/PieceSpecificationTable.module.scss';

const PieceSpecificationTable = ({ realWidth, realHeight, framed, comments, piece_type, with_header }) => {
    console.log(`PieceSpecificationTable TYPE: ${piece_type}`);

    const row_class = 'text-secondary hover:bg-secondary hover:text-dark'
    return (
        <div className={'w-fit rounded-md p-2.5'}>
            {with_header ? (
                <div className={'font-alegrya text-xl text-light bg-secondary p-2.5 text-center rounded-t-md'}>Piece Specifications</div>
            ) : null}
            <table
                className={
                    with_header ? 'w-fit border-separate border-spacing-0 font-lato text-light m-0 p-0 border-2 border-secondary rounded-b-md bg-primary' : 
                        'w-fit border-separate border-spacing-0 font-lato text-light m-0 p-0 border-2 border-secondary rounded-md bg-dark'
                }
            >
                <tbody className='text-primary '>
                    {realWidth && realHeight ? (
                        <tr className={'text-secondary hover:bg-secondary group'}>
                            <td className='border-b-2 border-secondary group-hover:text-dark p-1.5'>Dimensions</td>
                            <td className='border-b-2 border-l-2 border-secondary group-hover:text-dark p-1.5'>{`${realWidth}" x ${realHeight}"`}</td>
                        </tr>
                    ) : null}
                    {framed !== null ? (
                        <tr className={'text-secondary hover:bg-secondary group'}>
                            <td className='border-b-2 border-secondary group-hover:text-dark p-1.5'>Framed</td>
                            <td className='border-b-2 border-l-2 border-secondary group-hover:text-dark p-1.5'>{framed || framed.toString().toLowerCase() === 'true' ? 'Yes' : 'No'}</td>
                        </tr>
                    ) : null}
                    {piece_type ? (
                        <tr className={'text-secondary hover:bg-secondary group'}>
                            <td className='border-b-2 border-secondary group-hover:text-dark p-1.5'>Type</td>
                            <td className='border-b-2 border-l-2 border-secondary group-hover:text-dark p-1.5'>{piece_type}</td>
                        </tr>
                    ) : null}
                    {comments ? (
                        <tr className={'text-secondary hover:bg-secondary group'}>
                            <td className='border-b-2 border-secondary group-hover:text-dark p-1.5'>Comments</td>
                            <td className='border-b-2 border-l-2 border-secondary group-hover:text-dark p-1.5'>{comments}</td>
                        </tr>
                    ) : null}
                </tbody>
            </table>
        </div>
    );
};

export default PieceSpecificationTable;
