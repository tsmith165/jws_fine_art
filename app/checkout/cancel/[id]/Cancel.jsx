'use client';

import PROJECT_CONSTANTS from '@/lib/constants';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const Cancel = (props) => {
    const pathname = usePathname();
    const passed_o_id = pathname.split('/').slice(-1)[0];
    console.log(`LOADING CANCEL PAGE - Piece ID: ${passed_o_id}`);

    const piece_list = props.piece_list;
    const num_pieces = piece_list.length;

    console.log(`getServerSideProps piece_list length: ${num_pieces} | Data (Next Line):`);
    console.log(piece_list);

    var piece_position = 0;
    for (var i = 0; i < piece_list.length; i++) {
        if (piece_list[i]['o_id'].toString() == passed_o_id.toString()) {
            console.log(`Found piece at position ${i} | o_id: ${piece_list[i]['o_id']} | passed_o_id: ${passed_o_id}`);
            piece_position = i;
        }
    }
    var current_piece = piece_list[piece_position];

    /* prettier-ignore-start */
    var db_id = num_pieces < 1 ? -1 : current_piece.id !== undefined ? current_piece.id : -1;
    var o_id = num_pieces < 1 ? '' : current_piece.o_id !== undefined ? current_piece.o_id : '';
    var title = num_pieces < 1 ? '' : current_piece.title !== undefined ? current_piece.title : '';
    var price = num_pieces < 1 ? '' : current_piece.price !== undefined ? current_piece.price : '';
    var width = num_pieces < 1 ? '' : current_piece.width !== undefined ? current_piece.width : '';
    var height = num_pieces < 1 ? '' : current_piece.height !== undefined ? current_piece.height : '';
    var piece_type = num_pieces < 1 ? '' : current_piece.piece_type !== undefined ? current_piece.piece_type : piece_type;
    var real_width = num_pieces < 1 ? '' : current_piece.real_width !== undefined ? current_piece.real_width : '';
    var real_height = num_pieces < 1 ? '' : current_piece.real_height !== undefined ? current_piece.real_height : '';
    var image_path =
        num_pieces < 1
            ? ''
            : current_piece.image_path !== undefined
            ? `${PROJECT_CONSTANTS.AWS_BUCKET_URL}${current_piece.image_path}`
            : '';
    var instagram = num_pieces < 1 ? '' : current_piece.instagram !== undefined ? current_piece.instagram : '';
    /* prettier-ignore-end */

    const [state, setState] = useState({
        window_width: null,
        window_height: null,
        debug: false,
        loading: true,
        url_o_id: passed_o_id,
        piece_list: piece_list,
        current_piece: current_piece,
        piece_position: piece_position,
        db_id: db_id,
        o_id: o_id,
        image_jsx: null,
        title: title,
        price: price,
        instagram: instagram,
        price: price,
        address: '',
        international: null,
        error: '',
        error_found: false,
        width: width,
        height: height,
    });

    useEffect(() => {
        const handleResize = () => {
            console.log(`Window Width: ${window.innerWidth} | Height: ${window.innerHeight}`);
            setState({
                ...state,
                window_width: window.innerWidth,
                window_height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);

        const piece_position = state.piece_position;
        const image_path =
            state.current_piece.image_path !== undefined ? `${PROJECT_CONSTANTS.AWS_BUCKET_URL}${state.current_piece.image_path}` : '';

        var image_jsx =
            piece_position < 0 ? null : (
                <div key={`image_${piece_position}`} className={'flex h-full items-center justify-center'}>
                    <Image
                        id={`centered_image_${piece_position}`}
                        className={'h-full w-full object-contain'}
                        src={image_path}
                        alt={state.title}
                        priority={true}
                        quality={100}
                        width={state.width}
                        height={state.height}
                    />
                </div>
            );

        console.log(`Setting state with Piece Position: ${piece_position}`);
        setState({
            ...state,
            loading: false,
            image_jsx: image_jsx,
            window_width: window.innerWidth,
            window_height: window.innerHeight,
        });

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className={'flex h-full w-full flex-col overflow-y-auto md:flex-row'}>
            <div className={'h-fit w-full bg-dark md:h-full md:w-2/3'}>{state.image_jsx}</div>
            <div className={'h-full w-full bg-grey md:h-full md:w-1/3'}>
                <div className={'flex w-full justify-center bg-light p-0'}>
                    <div className={'flex w-full justify-center py-2 text-center font-lato text-2xl text-dark'}>
                        {state.title == '' ? `` : `"${state.title}"`}
                    </div>
                </div>
                <div className={'p-5 text-lg font-bold text-light'}>
                    <div className="text-red-500">{`Purchase Unsuccessful!`}</div>
                    <div className="text-primary">{`Try reloading the home page and selecting the piece again.`}</div>
                    <div className="text-primary">{`If problems persist, feel free to reach out at ${PROJECT_CONSTANTS.CONTACT_EMAIL}`}</div>
                </div>
            </div>
        </div>
    );
};

export default Cancel;
