'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { useUser } from '@clerk/nextjs';

import logger from '@/lib/logger';
import PROJECT_CONSTANTS from '@/lib/constants';

import NextImage from 'next/image';
import CustomNextImage from '@/components/wrappers/CustomNextImage';
import Link from 'next/link';

import { handleButtonLabelClickGTagEvent } from '@/lib/analytics';

import PieceSpecificationTable from '@/app/details/[id]/PieceSpecificationTable';
import TitleComponent from '@/app/details/[id]/TitleComponent';

import CircularProgress from '@mui/material/CircularProgress';

import { fetchDiscountRate } from '@/lib/api_calls';

const Details = (props) => {
    const { isLoaded, isSignedIn, user } = useUser();

    const router = useRouter();
    const pathname = usePathname();
    const passed_o_id = pathname.split('/').slice(-1)[0];

    console.log(`LOADING DETAILS PAGE - Piece ID: ${passed_o_id}`);
    console.log(`LOADING DETAILS PAGE - Piece ID: ${passed_o_id}`);

    const piece_list = props.piece_list;
    const num_pieces = piece_list == undefined || piece_list == null ? 0 : piece_list.length;

    var piece_position = 0;

    for (var i = 0; i < piece_list.length; i++) {
        if (piece_list[i]['o_id'].toString() == passed_o_id.toString()) {
            piece_position = i;
        }
    }

    var current_piece = piece_list[piece_position];

    var description_raw =
        current_piece.description == undefined ? '' : current_piece.description.length > 2 ? current_piece.description : '';

    /* prettier-ignore-start */
    var db_id = num_pieces < 1 ? -1 : current_piece.id !== undefined ? current_piece.id : -1;
    var o_id = num_pieces < 1 ? '' : current_piece.o_id !== undefined ? current_piece.o_id : '';
    var title = num_pieces < 1 ? '' : current_piece.title !== undefined ? current_piece.title : '';
    var price = num_pieces < 1 ? '' : current_piece.price !== undefined ? current_piece.price : '';
    var width = num_pieces < 1 ? '' : current_piece.width !== undefined ? current_piece.width : '';
    var height = num_pieces < 1 ? '' : current_piece.height !== undefined ? current_piece.height : '';
    var theme =
        num_pieces < 1 ? 'None' : current_piece.theme !== undefined ? (current_piece.theme == null ? 'None' : current_piece.theme) : 'None';
    var framed =
        num_pieces < 1
            ? 'False'
            : current_piece.framed == true || current_piece.framed.toString().toLowerCase() == 'true'
            ? 'True'
            : 'False';
    var sold =
        num_pieces < 1 ? 'False' : current_piece.sold == true || current_piece.sold.toString().toLowerCase() == 'true' ? 'True' : 'False';
    var available =
        num_pieces < 1 ? '' : current_piece.available == true || current_piece.sold.toString().toLowerCase() == 'true' ? 'True' : 'False';
    var piece_type = num_pieces < 1 ? '' : current_piece.piece_type !== undefined ? current_piece.piece_type : piece_type;
    var comments = num_pieces < 1 ? '' : current_piece.comments !== undefined ? current_piece.comments : '';
    var description = num_pieces < 1 ? '' : description_raw !== undefined ? description_raw.split('<br>').join('\n') : '';
    var real_width = num_pieces < 1 ? '' : current_piece.real_width !== undefined ? current_piece.real_width : '';
    var real_height = num_pieces < 1 ? '' : current_piece.real_height !== undefined ? current_piece.real_height : '';
    var image_path =
        num_pieces < 1
            ? ''
            : current_piece.image_path !== undefined
            ? `${PROJECT_CONSTANTS.AWS_BUCKET_URL}${current_piece.image_path}`
            : '';
    var instagram = num_pieces < 1 ? '' : current_piece.instagram !== undefined ? current_piece.instagram : '';

    console.log(`Piece Type: "${piece_type}"`);

    console.log(`Edit Page ${passed_o_id} Extra Images: "${current_piece.extra_images}"`);
    var extra_images =
        num_pieces < 1
            ? []
            : [undefined, null, ''].includes(current_piece.extra_images)
            ? []
            : current_piece.extra_images.includes(', ')
            ? current_piece.extra_images.split(', ')
            : current_piece.extra_images.length > 2
            ? current_piece.extra_images
            : [];
    console.log(`Using Extra Images: "${extra_images}"`);

    console.log(`Edit Page ${passed_o_id} Progress Images: "${current_piece.extra_images}"`);
    var progress_images =
        num_pieces < 1
            ? []
            : [undefined, null, ''].includes(current_piece.progress_images)
            ? []
            : current_piece.progress_images.includes(', ')
            ? current_piece.progress_images.split(', ')
            : current_piece.progress_images.length > 2
            ? current_piece.progress_images
            : [];
    console.log(`Using Progress Images: "${progress_images}"`);
    /* prettier-ignore-end */

    description = description.includes('<br>') ? description.split('<br>').join('\n') : description;
    console.log(`Description (Next Line):\n${description}`);

    var image_array = [];
    var extra_image_array = [];
    var progress_image_array = [];

    const [state, setState] = useState({
        window_width: null,
        window_height: null,
        debug: false,
        loading: true,
        url_o_id: passed_o_id,
        piece_list: piece_list,
        image_array: image_array,
        extra_image_array: extra_image_array,
        progress_image_array: progress_image_array,
        extra_images: extra_images,
        progress_images: progress_images,
        current_piece: current_piece,
        piece_position: piece_position,
        db_id: db_id,
        o_id: o_id,
        image_path: image_path,
        description: description,
        title: title,
        piece_type: piece_type,
        available: available,
        sold: sold,
        price: price,
        instagram: instagram,
        theme: theme,
        width: width,
        height: height,
        real_width: real_width,
        real_height: real_height,
        framed: framed,
        comments: comments,
        next_oid:
            piece_position + 1 > num_pieces - 1 // if next piece is out of bounds (greater than piece list length), set to first piece
                ? piece_list[0]['o_id']
                : piece_list[piece_position + 1]['o_id'],
        last_oid:
            piece_position - 1 < 0 // if last piece is out of bounds (less than 0), set to last piece
                ? piece_list[num_pieces - 1]['o_id']
                : piece_list[piece_position - 1]['o_id'],
        selected_gallery_image: 0,
        discount_rate: 0,
    });

    useEffect(() => {
        // Initial Load
        const handleResize = () => {
            console.log(`Window Width: ${window.innerWidth} | Height: ${window.innerHeight}`);
            setState((prevState) => ({
                ...prevState,
                window_width: window.innerWidth,
                window_height: window.innerHeight,
            }));
        };

        window.addEventListener('resize', handleResize);

        const fetchDiscountRateAsync = async () => {
            const response = await fetchDiscountRate();
            console.log(`Discount Rate: ${response}`);
            setState((prevState) => ({ ...prevState, discount_rate: response }));
        };
        fetchDiscountRateAsync();

        // Create image arrays and update state
        var image_array = [];
        var extra_image_array = [];
        var progress_image_array = [];
        const num_pieces = state.piece_list.length;
        if (num_pieces > 0) {
            image_array = create_image_array(state.piece_list, state.piece_position);

            extra_image_array = create_extra_image_array(state.extra_images, state.selected_gallery_image);

            progress_image_array = create_extra_image_array(state.progress_images, state.selected_gallery_image);
        }

        console.log(`Setting state with Piece Position: ${state.piece_position} | piece list length: ${num_pieces}`);
        update_state({
            loading: false,
            window_width: window.innerWidth,
            window_height: window.innerHeight,
            image_array: image_array,
            extra_image_array: extra_image_array,
            progress_image_array: progress_image_array,
            next_oid:
                state.piece_position + 1 > num_pieces - 1
                    ? state.piece_list[0]['o_id']
                    : state.piece_list[state.piece_position + 1]['o_id'],
            last_oid:
                state.piece_position - 1 < 0
                    ? state.piece_list[num_pieces - 1]['o_id']
                    : state.piece_list[state.piece_position - 1]['o_id'],
        });

        return () => {
            // Cleanup
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const update_state = (newState) => {
        console.log(`Updating state with object (Next Line):`);
        console.log(newState);

        setState((prevState) => ({ ...prevState, ...newState }));
    };

    const update_current_piece = async (piece_list, o_id) => {
        update_state({ loading: true });

        const previous_url_o_id = state.url_o_id;
        const num_pieces = piece_list.length;

        console.log(`Piece Count: ${num_pieces} | Searching for URL_O_ID: ${o_id}`);
        const [piece_position, current_piece] = await get_piece_from_path_o_id(piece_list, o_id);
        const current_db_id = current_piece['id'];
        const current_o_id = current_piece['o_id'];

        console.log(
            `Piece Position: ${piece_position} | Piece DB ID: ${current_db_id} | Piece O ID: ${current_o_id} | Description (Next Line):`,
        );
        console.log(current_piece.description);

        const next_oid = piece_position + 1 > num_pieces - 1 ? piece_list[0].o_id : piece_list[piece_position + 1].o_id;
        const last_oid = piece_position - 1 < 0 ? piece_list[num_pieces - 1].o_id : piece_list[piece_position - 1].o_id;

        console.log(
            `Updating to new selected piece with Postition: ${piece_position} | ` +
                `DB ID: ${current_db_id} | O_ID: ${current_o_id} | NEXT_O_ID: ${next_oid} | LAST_O_ID: ${last_oid}`,
        );

        const image_array = create_image_array(state.piece_list, piece_position);

        console.log(`Description type: ${typeof description} | Value (Next Line):\n ${description}`);

        var description = current_piece.description;
        description = description.includes('<br>') ? description.split('<br>').join('\n') : description;
        console.log(`Description (Next Line):\n${description}`);

        var extra_images =
            num_pieces < 1
                ? []
                : [undefined, null, ''].includes(current_piece.extra_images)
                ? []
                : current_piece.extra_images.includes(', ')
                ? current_piece.extra_images.split(', ')
                : current_piece.extra_images.length > 2
                ? current_piece.extra_images
                : [];
        var progress_images =
            num_pieces < 1
                ? []
                : [undefined, null, ''].includes(current_piece.progress_images)
                ? []
                : current_piece.progress_images.includes(', ')
                ? current_piece.progress_images.split(', ')
                : current_piece.progress_images.length > 2
                ? current_piece.progress_images
                : [];

        update_state(
            {
                loading: false,
                url_o_id: o_id,
                piece_list: piece_list,
                image_array: image_array,
                piece_position: piece_position,
                current_piece: current_piece,
                db_id: current_db_id,
                o_id: current_o_id,
                title: current_piece.title,
                piece_type: current_piece.piece_type,
                description: description,
                sold: current_piece.sold,
                price: current_piece.price,
                width: current_piece.width,
                height: current_piece.height,
                real_width: current_piece.real_width,
                real_height: current_piece.real_height,
                image_path: `${PROJECT_CONSTANTS.AWS_BUCKET_URL}${current_piece.image_path}`,
                instagram: current_piece.instagram,
                available: current_piece.available !== undefined ? current_piece.available : false,
                framed: current_piece.framed !== undefined ? current_piece.framed : false,
                comments: current_piece.comments,
                next_oid: next_oid,
                last_oid: last_oid,
                sold: current_piece.sold,
                available: current_piece.available,
                price: current_piece.price,
                extra_images: extra_images,
                progress_images: progress_images,
                selected_gallery_image: 0,
            },
            async () => {
                if (previous_url_o_id != o_id) {
                    router.push(`/details/${o_id}`);
                }
            },
        );
    };

    const create_image_array = (piece_list, piece_position) => {
        console.log(`Current window width: ${window.innerWidth} | piece position: ${piece_position}`);

        var image_array = [];
        for (var i = 0; i < piece_list.length; i++) {
            let piece = piece_list[i];
            let selected = i == piece_position ? true : false;
            image_array.push(
                <div key={`image_${i}`} className={selected ? 'relative h-full !w-full' : 'hidden'}>
                    <CustomNextImage
                        id={`centered_image_${i}`}
                        src={`${PROJECT_CONSTANTS.AWS_BUCKET_URL}${piece.image_path}`}
                        alt={piece.title}
                        priority={i > piece_position - 3 && i < piece_position + 3 ? true : false}
                        quality={100}
                        width={state.width}
                        height={state.height}
                        hidden={selected ? false : true}
                    />
                </div>,
            );
        }
        return image_array;
    };

    const create_extra_image_array = (extra_images, selected_image_index) => {
        var using_extra_images = typeof extra_images === 'string' ? JSON.parse(extra_images) : extra_images;

        var extra_image_array = [];
        using_extra_images.map((image, index) => {
            extra_image_array.push(
                <div key={`extra_image_${index}`} className={index == selected_image_index ? 'relative h-full !w-full' : 'hidden'}>
                    <CustomNextImage
                        id={`extra_image_${index}`}
                        src={image.image_path}
                        alt={image.image_path}
                        priority={true}
                        width={image.width}
                        height={image.height}
                        quality={100}
                    />
                </div>,
            );
        });

        return extra_image_array;
    };

    const get_piece_from_path_o_id = async (piece_list, o_id) => {
        for (var i = 0; i < piece_list.length; i++) {
            if (piece_list[i]['o_id'].toString() == o_id.toString()) {
                return [i, piece_list[i]];
            }
        }
    };

    // RENDER BEGINS HERE
    const piece_title = state.title != null ? state.title : '';

    let using_extra_images = null;
    try {
        using_extra_images = typeof state.extra_images === 'string' ? JSON.parse(state.extra_images) : state.extra_images;
    } catch (error) {}

    console.log(`using_extra_images type: ${typeof using_extra_images} | data (next line):`);
    console.log(using_extra_images);

    let using_progress_images = null;
    try {
        using_progress_images = typeof state.progress_images === 'string' ? JSON.parse(state.progress_images) : state.progress_images;
    } catch (error) {}

    console.log(`using_progress_images type: ${typeof using_progress_images} | data (next line):`);
    console.log(using_progress_images);

    // Gallery Loader Container JSX
    const image_loader_container_jsx = (
        <div className={`flex h-full w-full flex-col items-center justify-center`}>
            <div className="pb-5 text-xl font-[600] text-light">Loading Gallery</div>
            <CircularProgress color="inherit" className="h-[100px] w-[100px] text-light" />
        </div>
    );

    // Main Image Container JSX
    const image_container_jsx =
        state.loading === true
            ? image_loader_container_jsx
            : state.selected_gallery_image === 0
            ? state.image_array
            : state.selected_gallery_image < state.extra_image_array.length + 1
            ? state.extra_image_array
            : state.progress_image_array;

    const extra_images_gallery_container_jsx =
        state.loading == true ? null : [null, undefined].includes(using_extra_images) ? null : using_extra_images.length < 1 ? null : (
            <div className={'flex h-full w-full flex-row flex-nowrap items-start'}>
                {state.loading == true
                    ? null
                    : using_extra_images.map((image, index) => {
                          console.log(image);
                          var image_path = image.image_path.split('/').slice(-2).join('/');
                          console.log(`Path: ${image_path} | Width: ${image.width} | Height: ${image.height}`);
                          return (
                              <div
                                  key={`extra_image_container_${index}`}
                                  className={`relative mr-2 h-[110px] w-[110px] overflow-hidden rounded-md ${
                                      state.selected_gallery_image === index + 1 ? ` bg-primary` : `bg-tertiary`
                                  }`}
                              >
                                  <div
                                      className={`m-[5px] h-[100px] w-[100px]`}
                                      onClick={async () => {
                                          const extra_image_array = create_extra_image_array(state.extra_images, index);
                                          update_state({ selected_gallery_image: index + 1, extra_image_array: extra_image_array });
                                      }}
                                  >
                                      <CustomNextImage
                                          src={`${PROJECT_CONSTANTS.AWS_BUCKET_URL}/${image_path}`}
                                          alt={``}
                                          width={image.width}
                                          height={image.height}
                                          quality={100}
                                      />
                                  </div>
                              </div>
                          );
                      })}
            </div>
        );

    const main_image_gallery_container_jsx =
        extra_images_gallery_container_jsx == null ? null : (
            <div
                className={`mr-2 flex !h-[110px] max-h-full !w-[110px] max-w-[110px] flex-row rounded-md ${
                    state.selected_gallery_image === 0 ? ` bg-primary` : `bg-tertiary`
                }`}
            >
                <div className={`relative mr-[5px] h-full w-full`}>
                    <div
                        className={`m-1 h-[100px] w-[100px]`}
                        onClick={() => {
                            update_state({ selected_gallery_image: 0 });
                        }}
                    >
                        <CustomNextImage src={state.image_path} alt={``} width={state.width} height={state.height} quality={100} />
                    </div>
                </div>
            </div>
        );

    const main_image_and_extra_images_gallery_container_jsx =
        extra_images_gallery_container_jsx == null ? null : (
            <div className="flex !h-[120px] !max-h-[120px] !min-h-[120px] flex-row overflow-x-auto overflow-y-hidden bg-light p-1">
                {main_image_gallery_container_jsx}

                {extra_images_gallery_container_jsx}
            </div>
        );

    const final_image_container_jsx =
        extra_images_gallery_container_jsx == null ? (
            <div className="h-full w-full bg-dark">{image_container_jsx}</div>
        ) : (
            <div className={'flex h-full w-full flex-col'}>
                <div className="!h-[calc(100%-120px)] !max-h-[calc(100%-120px)] w-full">{image_container_jsx}</div>

                {main_image_and_extra_images_gallery_container_jsx}
            </div>
        );

    const progress_images_gallery_container_jsx =
        state.loading == true ? null : [null, undefined].includes(using_progress_images) ? null : using_progress_images.length <
          1 ? null : (
            <div className={'flex min-w-[300px] flex-col p-3'}>
                <div className={'rounded-t-md bg-primary px-2 py-1 text-lg font-bold text-dark'}>Pictures of piece in progress:</div>
                <div className={`h-fit rounded-b-md bg-dark`}>
                    <div className={`flex max-h-full w-full flex-row p-2`}>
                        {state.loading == true
                            ? null
                            : using_progress_images.map((image, index) => {
                                  var image_path = image.image_path.split('/').slice(-2).join('/');
                                  logger.extra(`Path: ${image_path} | Width: ${image.width} | Height: ${image.height}`);
                                  return (
                                      <div
                                          key={`progress_image_${index}`}
                                          className={`relative mr-[5px] h-[110px] w-[110px] overflow-hidden rounded-md ${
                                              state.selected_gallery_image === index + (using_extra_images.length + 1)
                                                  ? `bg-primary`
                                                  : `bg-tertiary`
                                          }`}
                                      >
                                          <div
                                              className={`m-[5px] h-[100px] w-[100px]`}
                                              onClick={async () => {
                                                  const progress_image_array = create_extra_image_array(state.progress_images, index);
                                                  update_state({
                                                      selected_gallery_image: index + using_extra_images.length + 1,
                                                      progress_image_array: progress_image_array,
                                                  });
                                              }}
                                          >
                                              <CustomNextImage
                                                  src={
                                                      image_path.includes(PROJECT_CONSTANTS.AWS_BUCKET_URL)
                                                          ? image_path
                                                          : `${PROJECT_CONSTANTS.AWS_BUCKET_URL}/${image_path}`
                                                  }
                                                  alt={``}
                                                  width={image.width}
                                                  height={image.height}
                                                  quality={100}
                                              />
                                          </div>
                                      </div>
                                  );
                              })}
                    </div>
                </div>
            </div>
        );

    // Title Container JSX
    const title_container = (
        <TitleComponent
            title={piece_title == '' ? `` : `${piece_title}`}
            piece_list={state.piece_list}
            next_oid={state.next_oid}
            last_oid={state.last_oid}
            update_current_piece={update_current_piece}
        />
    );

    // Sold Label JSX
    const sold_label = <div className={'py-1 text-xl font-[600] text-red-800'}>Sold</div>;

    // Unavailable Label JSX
    const unavailable_label = <div className={'py-1 text-xl font-[600] text-red-800'}>Not For Sale</div>;

    // Price Label JSX
    const price_label = (
        <Link
            href={`/checkout/${state.url_o_id}`}
            className={'flex h-fit w-fit flex-row space-x-2.5'}
            onClick={() =>
                handleButtonLabelClickGTagEvent(
                    'details_checkout_button_click',
                    'Details Checkout Button',
                    'Details Checkout Button Clicked',
                )
            }
        >
            {state.discount_rate > 0.0 ? (
                <>
                    <div className={`text-lg font-bold leading-10 text-primary line-through decoration-red-500`}>{`$${state.price}`}</div>
                    <div className={`text-lg font-bold leading-10 text-red-500`}>{`$${
                        state.price - state.price * state.discount_rate
                    }`}</div>
                </>
            ) : (
                <div className={`text-lg font-bold leading-10 text-dark`}>{`$${state.price}`}</div>
            )}
            <div className={'flex rounded-md bg-dark px-2 py-1 hover:bg-light'}>
                <NextImage src="/stripe_checkout_tan-221_50.png" alt="View Stripe Info" priority={true} width={133} height={30} />
            </div>
        </Link>
    );

    const sold_value = state.sold.toString().toLowerCase();
    // Uses sold label if piece sold, unavailable label if piece not for sale, or price label if piece is for sale
    const price_jsx = sold_value == 'true' ? sold_label : state.available == false ? unavailable_label : price_label;

    // Instagram Button JSX
    const instagram_jsx =
        state.instagram != null && state.instagram != '' && state.instagram.length > 5 ? (
            <Link className={'rounded-md bg-dark p-1.5 hover:bg-light'} href={`https://www.instagram.com/p/${state.instagram}`}>
                <NextImage src="/instagram_icon_100.png" alt="Instagram Link" priority={true} width={25} height={25} />
            </Link>
        ) : null;

    // Edit Piece Button JSX
    var edit_piece_button_jsx = null;
    if (isLoaded && user && user.publicMetadata && user.publicMetadata.role) {
        console.log('USER: ', user);

        if (user.publicMetadata.role == 'ADMIN') {
            edit_piece_button_jsx = (
                <Link href={`/edit/${state.url_o_id}`}>
                    <div
                        className={
                            'w-fit whitespace-nowrap rounded-md bg-dark px-2.5 py-1.5 text-lg text-light hover:bg-light hover:text-dark'
                        }
                    >
                        Edit Piece
                    </div>
                </Link>
            );
        }
    }

    // Piece Description Text Block
    const description_jsx =
        state.description != null && state.description.length > 2 ? (
            <div className="w-full px-4 pt-5">
                <h3 className="h-max w-full whitespace-pre-wrap font-lato text-xl font-[600] text-secondary">{state.description}</h3>
            </div>
        ) : null;

    // Piece Specification Table
    const piece_specification_table = (
        <PieceSpecificationTable
            realWidth={state.real_width}
            realHeight={state.real_height}
            framed={state.framed}
            comments={state.comments}
            piece_type={state.piece_type}
            with_header={false}
        />
    );

    const details_form = (
        <div className="flex !h-max w-full flex-col">
            {piece_specification_table}

            <div className={'flex flex-row'}>
                <div className={'flex flex-row space-x-2.5 px-2.5'}>
                    {price_jsx}
                    {instagram_jsx}
                    {edit_piece_button_jsx}
                </div>
            </div>
            {description_jsx}
        </div>
    );

    return (
        <>
            <div className={'flex h-full w-full flex-col md:flex-row'}>
                <div className={'!h-[500px] !max-h-[500px] w-full bg-dark md:!h-full md:!max-h-full md:w-[65%]'}>
                    {final_image_container_jsx}
                </div>
                <div className={'h-full w-full bg-grey md:w-[35%]'}>
                    {title_container}
                    {details_form}
                    {progress_images_gallery_container_jsx}
                    <div className="h-4 w-full"></div>
                </div>
            </div>

            <div style={{ display: 'none' }}>
                {state.piece_list
                    .filter((_, i) => i >= state.piece_position - 5 && i <= state.piece_position + 5)
                    .map((piece, i) => (
                        <img
                            key={`preload_${i}`}
                            src={`${PROJECT_CONSTANTS.AWS_BUCKET_URL}${piece.image_path}`}
                            alt={`Preload ${piece.title}`}
                        />
                    ))}
            </div>
        </>
    );
};

export default Details;
