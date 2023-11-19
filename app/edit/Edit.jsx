'use client';

import logger from '@/lib/logger';
import PROJECT_CONSTANTS from '@/lib/constants';

import React, { useState, useEffect, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { useUser } from '@clerk/nextjs';

import CustomNextImage from '@/components/wrappers/CustomNextImage';

import { fetch_pieces, updateExtraImagesOrder } from '@/lib/api_calls';

import EditForm from './EditForm';

import mobile_styles from '@/styles/pages/DetailsMobile.module.scss';
import desktop_styles from '@/styles/pages/DetailsDesktop.module.scss';

import edit_details_styles from '@/styles/pages/EditDetails.module.scss';
import form_styles from '@/styles/forms/Form.module.scss';
import title_styles from '@/styles/components/TitleInputTextbox.module.scss';

import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import CircularProgress from '@mui/material/CircularProgress';
import PageviewIcon from '@mui/icons-material/Pageview';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

const Edit = (props) => {
    const { isLoaded, isSignedIn, user } = useUser();

    const router = useRouter();
    const pathname = usePathname();
    const passed_o_id = pathname.split('/').slice(-1)[0];
    console.log(`LOADING EDIT DETAILS PAGE - Piece ID: ${passed_o_id}`);

    const piece_list = props.piece_list;
    const num_pieces = piece_list.length;

    console.log(`getServerSideProps piece_list length: ${num_pieces} | Piece List Type: ${typeof piece_list} | Data (Next Line):`);
    console.log(piece_list);

    var piece_position = 0;

    for (var i = 0; i < piece_list.length; i++) {
        if (piece_list[i]['o_id'].toString() == passed_o_id.toString()) {
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
        num_pieces < 1
            ? ''
            : current_piece.available == true || current_piece.available.toString().toLowerCase() == 'true'
            ? 'True'
            : 'False';
    var piece_type = num_pieces < 1 ? '' : current_piece.piece_type !== undefined ? current_piece.piece_type : piece_type;
    var comments = num_pieces < 1 ? '' : current_piece.comments !== undefined ? current_piece.comments : '';
    var description =
        num_pieces < 1 ? '' : current_piece.description !== undefined ? current_piece.description.split('<br>').join('\n') : '';
    var real_width = num_pieces < 1 ? '' : current_piece.real_width !== undefined ? current_piece.real_width : '';
    var real_height = num_pieces < 1 ? '' : current_piece.real_height !== undefined ? current_piece.real_height : '';
    var instagram = num_pieces < 1 ? '' : current_piece.instagram !== undefined ? current_piece.instagram : '';

    var image_path =
        num_pieces < 1
            ? ''
            : current_piece.image_path === undefined
            ? ''
            : current_piece.image_path.includes(PROJECT_CONSTANTS.AWS_BUCKET_URL)
            ? current_piece.image_path
            : `${PROJECT_CONSTANTS.AWS_BUCKET_URL}${current_piece.image_path}`;

    console.log(`Piece Position: ${piece_position} | Current DB ID: ${db_id} | Data (Next Line):`);
    console.log(current_piece);

    // Extra Images
    var extra_images = [undefined, null, ''].includes(current_piece.extra_images) ? [] : current_piece.extra_images;
    console.log(`Edit Page ${passed_o_id} Extra Images: "${extra_images}"`);

    extra_images = typeof extra_images === 'string' ? JSON.parse(extra_images) : extra_images;
    extra_images = num_pieces < 1 ? [] : [undefined, null, ''].includes(extra_images) ? [] : extra_images;
    console.log(`Using Extra Images: "${extra_images}"`);

    // Progress Images
    var progress_images = [undefined, null, ''].includes(current_piece.progress_images) ? [] : current_piece.progress_images;
    console.log(`Edit Page ${passed_o_id} Progress Images: "${progress_images}"`);

    progress_images = typeof progress_images === 'string' ? JSON.parse(progress_images) : progress_images;
    progress_images = num_pieces < 1 ? [] : [undefined, null, ''].includes(progress_images) ? [] : progress_images;
    console.log(`Using Progress Images: "${progress_images}"`);
    /* prettier-ignore-end */

    var theme_options = [{ value: theme, label: theme }];
    if (theme != 'None' && theme.includes(', ')) {
        // logger.extra(`Splitting theme string: ${theme}`);
        theme_options = [];
        theme.split(', ').forEach(function (theme_string) {
            if (theme_string.length > 1) {
                // logger.extra(`Adding theme string ${theme_string} to options...`);
                theme_options.push({ value: theme_string, label: theme_string });
            }
        });
    }

    var current_image_array = [];
    var extra_image_array = [];
    var progress_image_array = [];

    const [state, setState] = useState({
        window_width: null,
        window_height: null,
        styles: desktop_styles,
        url_o_id: passed_o_id,
        piece_list: piece_list,
        current_image_array: current_image_array,
        extra_image_array: extra_image_array,
        progress_image_array: progress_image_array,
        extra_images: extra_images,
        progress_images: progress_images,
        current_piece: current_piece,
        piece_position: piece_position,
        db_id: db_id,
        o_id: o_id,
        image_path: image_path,
        piece_type: piece_type,
        description: description,
        title: title,
        available: available,
        sold: sold,
        price: price,
        instagram: instagram,
        theme: theme,
        theme_options: theme_options,
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
        loading: true,
        updating: false,
        resizing: false,
        uploading: false,
        updated: false,
        uploaded: false,
        upload_error: false,
        uploaded_image_path: '',
        file_upload_type: 'cover',
        new_piece_created: false,
        error: false,
        staging_db_id: -2,
        selected_gallery_image: 0,
    });

    useEffect(() => {
        const handleResize = () => {
            console.log(`Window Width: ${window.innerWidth} | Height: ${window.innerHeight}`);
            update_state({
                window_width: window.innerWidth,
                window_height: window.innerHeight,
            });
        };
        console.log('Component mounted.');

        if (!isLoaded) {
            console.log('User not loaded.  Not setting initial state.');
        } else if (!isSignedIn) {
            console.log('User not signed in.  Not setting initial state.');
        } else if (user.publicMetadata?.role?.toLowerCase() != 'admin') {
            console.log('User not admin.  Not setting initial state.');
        } else {
            console.log('Component mounted and user signed in.  Loading image arrays...');
            var current_image_array = [];
            var extra_image_array = [];
            var progress_image_array = [];
            const num_pieces = state.piece_list.length;
            console.log('Component did mount num pieces: ', num_pieces);
            if (num_pieces > 0) {
                current_image_array = create_image_array(state.piece_list, state.piece_position, state.staging_db_id, true);
                extra_image_array = create_extra_image_array(state.extra_images, state.selected_gallery_image);
                progress_image_array = create_extra_image_array(state.progress_images, state.selected_gallery_image);
            }

            console.log(`Setting state with Piece Position: ${state.piece_position} | piece list length: ${num_pieces}`);
            update_state({
                loading: false,
                window_width: window.innerWidth,
                window_height: window.innerHeight,
                current_image_array: current_image_array,
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
        }

        window.addEventListener('resize', handleResize); // Add event listener

        // Cleanup function on unmount
        return () => {
            window.removeEventListener('resize', handleResize);

            update_state({
                staging_db_id: -2,
            });
        };
    }, [isLoaded, isSignedIn, user]);

    const update_state = (newState) => {
        console.log(`Updating state with object (Next Line):`);
        console.log(newState);

        setState((prevState) => ({ ...prevState, ...newState }));
    };

    const update_state_with_callback = async (state, callback) => {
        console.log(`Updating state with object (Next Line):`);
        console.log(state);

        setState(
            (prevState) => ({ ...prevState, ...state }),
            () => {
                console.log(`Updated state (Next Line):`);
                console.log(state);

                callback();
            },
        );
    };

    const fetch_pieces_from_api = async (type = 'none') => {
        console.log(`Fetching Piece List`);
        update_state({ loading: true, updated: false });

        const piece_list = await fetch_pieces();
        piece_list.sort((a, b) => a['o_id'] - b['o_id']);

        // Add AWS bucket URL to the image_path if not exists
        piece_list.forEach((piece) => {
            piece.image_path = piece.image_path.includes(PROJECT_CONSTANTS.AWS_BUCKET_URL)
                ? piece.image_path
                : `${PROJECT_CONSTANTS.AWS_BUCKET_URL}${piece.image_path}`;
        });

        logger.extra('Pieces fetched in state (Next Line):');
        logger.extra(piece_list);

        const state =
            type == 'none'
                ? { piece_list: piece_list, loading: false }
                : {
                      piece_list: piece_list,
                      loading: false,
                      updating: false,
                      uploading: false,
                      updated: type == 'updated' ? true : false,
                      uploaded: type == 'uploaded' ? true : false,
                      staging_db_id: type == 'updated' ? -2 : state.staging_db_id,
                      new_piece_created: false,
                  };
        logger.extra(`Setting state with type: ${type} (Next Line):`);
        logger.extra(state);
        update_state_with_callback(state, async () => {
            await update_current_piece(state.piece_list, state.url_o_id, type == 'none' ? false : true);
        });
    };

    const update_current_piece = async (piece_list, o_id, preserve_submit_state = false) => {
        update_state({ loading: true });

        const num_pieces = piece_list.length;

        console.log(`Updating Current Piece to o_id: ${o_id}`);
        const piece_from_path_o_id = await get_piece_from_path_o_id(piece_list, o_id);
        const [piece_position, current_piece] = piece_from_path_o_id;
        const current_db_id = current_piece.id;
        const current_o_id = current_piece.o_id;

        console.log(`Piece Position: ${piece_position} | Current DB ID: ${current_db_id} | Data (Next Line):`);
        console.log(current_piece);

        const next_oid = piece_position + 1 > num_pieces - 1 ? piece_list[0].o_id : piece_list[piece_position + 1].o_id;
        const last_oid = piece_position - 1 < 0 ? piece_list[num_pieces - 1].o_id : piece_list[piece_position - 1].o_id;

        var theme = current_piece.theme == null || current_piece.theme == undefined ? 'None' : current_piece.theme;
        var theme_options = [{ value: theme, label: theme }];

        if (theme != 'None' && theme.includes(', ')) {
            theme_options = [];
            theme.split(', ').forEach(function (theme_string) {
                if (theme_string.length > 1) {
                    logger.extra(`Adding theme string ${theme_string} to options...`);
                    theme_options.push({ value: theme_string, label: theme_string });
                }
            });
        }

        logger.extra(`Setting theme to: ${theme} | framed: ${current_piece.framed} | options (Next line):`);
        logger.extra(theme_options);

        const current_image_array = await create_image_array(state.piece_list, piece_position, state.staging_db_id, true);

        // Extra Images
        var extra_images = [undefined, null, ''].includes(current_piece.extra_images) ? [] : current_piece.extra_images;
        console.log(`Current Piece Extra Images: "${extra_images}"`);

        extra_images = typeof extra_images === 'string' ? JSON.parse(extra_images) : extra_images;
        extra_images = num_pieces < 1 ? [] : [undefined, null, ''].includes(extra_images) ? [] : extra_images;
        console.log(`Using Extra Images: "${extra_images}"`);

        // Progress Images
        var progress_images = [undefined, null, ''].includes(current_piece.progress_images) ? [] : current_piece.progress_images;
        console.log(`Current Piece Progress Images: "${progress_images}"`);

        progress_images = typeof progress_images === 'string' ? JSON.parse(progress_images) : progress_images;
        progress_images = num_pieces < 1 ? [] : [undefined, null, ''].includes(progress_images) ? [] : progress_images;
        console.log(`Using Progress Images: "${progress_images}"`);

        const extra_image_array = await create_extra_image_array(extra_images, state.selected_gallery_image);

        const progress_image_array = await create_extra_image_array(progress_images, state.selected_gallery_image);

        console.log(`UPDATE PIECE IMAGE PATH: ${current_piece.image_path}`);

        const previous_url_o_id = state.url_o_id;
        update_state(
            {
                url_o_id: current_o_id,
                piece_list: piece_list,
                current_image_array: current_image_array,
                extra_image_array: extra_image_array,
                progress_image_array: progress_image_array,
                piece_position: piece_position,
                db_id: current_db_id,
                o_id: current_o_id,
                current_piece: current_piece,
                next_oid: next_oid,
                last_oid: last_oid,
                title: current_piece.title,
                piece_type: current_piece.piece_type,
                description: current_piece.description.split('<br>').join('\n'),
                price: current_piece.price,
                width: current_piece.width,
                height: current_piece.height,
                real_width: current_piece.real_width,
                real_height: current_piece.real_height,
                image_path: current_piece.image_path.includes(PROJECT_CONSTANTS.AWS_BUCKET_URL)
                    ? current_piece.image_path
                    : `${PROJECT_CONSTANTS.AWS_BUCKET_URL}${current_piece.image_path}`,
                instagram: current_piece.instagram,
                available: current_piece.available == true || current_piece.available.toString().toLowerCase() == 'true' ? 'True' : 'False',
                sold: current_piece.sold == true || current_piece.sold.toString().toLowerCase() == 'true' ? 'True' : 'False',
                framed: current_piece.framed == true || current_piece.framed.toString().toLowerCase() == 'true' ? 'True' : 'False',
                comments: current_piece.comments,
                theme: theme,
                theme_options: theme_options,
                loading: false,
                updating: false,
                uploading: false,
                updated: false,
                error: false,
                updated: preserve_submit_state == true ? state.updated : false,
                uploaded: preserve_submit_state == true ? state.uploaded : false,
                upload_error: false,
                extra_images: extra_images,
                progress_images: progress_images,
                selected_gallery_image: 0,
            },
            async () => {
                if (previous_url_o_id != o_id) {
                    props.router.push(`/edit/${o_id}`);
                }
            },
        );
    };

    const create_image_array = async (piece_list, piece_position, db_id, only_load_cover = false) => {
        const styles = window.innerWidth === undefined ? desktop_styles : window.innerWidth > 1000 ? desktop_styles : mobile_styles;

        var temp_image_array = [];
        for (var i = 0; i < piece_list.length; i++) {
            let piece = piece_list[i];
            console.log('create image array piece: ', piece);
            if (i == piece_position) {
                console.log(`Found Staging DB ID: ${db_id} | Current index: ${piece.id}`);
            } else {
                if (only_load_cover == true) {
                    continue;
                }
            }

            temp_image_array.push(
                <div key={`image_${i}`} className={i == piece_position ? 'relative flex h-full w-full justify-center' : 'invisible'}>
                    {db_id == -1 ? null : db_id != piece.id ? null : <div className="h-full w-full">Staging</div>}
                    <CustomNextImage
                        id={`edit_image_${i}`}
                        src={piece.image_path}
                        alt={piece['title']}
                        priority={i > piece_position - 3 && i < piece_position + 3 ? true : false}
                        width={piece.width}
                        height={piece.height}
                        quality={100}
                    />
                </div>,
            );
        }
        return temp_image_array;
    };

    const create_extra_image_array = async (extra_images, selected_image_index) => {
        const styles = window.innerWidth === undefined ? desktop_styles : window.innerWidth > 1000 ? desktop_styles : mobile_styles;

        var using_extra_images = typeof extra_images === 'string' ? JSON.parse(extra_images) : extra_images;

        var temp_extra_image_array = [];
        using_extra_images.map((image, index) => {
            temp_extra_image_array.push(
                <div
                    key={`extra_image_${index}`}
                    className={index == selected_image_index ? styles.centered_image_container : styles.centered_image_container_hidden}
                >
                    <CustomNextImage
                        id={`extra_image_${index}`}
                        className={styles.centered_image}
                        src={image.image_path}
                        alt={image.image_path}
                        priority={true}
                        width={300}
                        height={300}
                        quality={100}
                    />
                </div>,
            );
        });

        return temp_extra_image_array;
    };

    const get_piece_from_path_o_id = async (piece_list, o_id) => {
        for (var i = 0; i < piece_list.length; i++) {
            if (piece_list[i]['o_id'].toString() == o_id.toString()) {
                return [i, piece_list[i]];
            }
        }
    };

    const load_changed_images = async (uploaded_image_path) => {
        if (uploaded_image_path == '') {
            console.error(`Failed to upload image.  Cannot load file...`);
            return false;
        }

        var width = -1;
        var height = -1;

        try {
            var image = new Image();
            image.src = uploaded_image_path;

            //Validate the File Height and Width.
            image.onload = async () => {
                console.log(`WIDTH: ${image.width} | HEIGHT: ${image.height}`);
                width = image.width;
                height = image.height;

                load_image_arrays(uploaded_image_path, width, height);
            };
        } catch (err) {
            update_state({ uploaded: false, upload_error: true });
            console.error(`Image Load Error: ${err.message}`);
            return false;
        }
    };

    const load_image_arrays = async (uploaded_image_path, width, height) => {
        // Cover Images Update
        if (
            state.file_upload_type.toString().toLowerCase().includes('piece') ||
            state.file_upload_type.toString().toLowerCase().includes('cover')
        ) {
            var updated_piece = state.piece_list[state.piece_position];
            updated_piece = { ...updated_piece, ...{ image_path: uploaded_image_path, width: width, height: height } };
            var updated_piece_list = state.piece_list;
            updated_piece_list[state.piece_position] = updated_piece;
            const current_image_array = await create_image_array(updated_piece_list, state.piece_position, state.db_id, true);

            console.log(`Pre-Update Cover Image (Next Line):`);
            console.log(state.image_path);
            update_state({
                piece_list: updated_piece_list,
                width: width,
                height: height,
                uploaded_image_path: uploaded_image_path,
                image_path: uploaded_image_path,
                current_image_array: current_image_array,
                staging_db_id: state.db_id,
                loading: false,
                uploading: false,
                resizing: false,
                uploaded: true,
            });
            return true;
        }

        // Extra Images Update
        if (state.file_upload_type.toString().toLowerCase().includes('extra')) {
            var current_extra_images = [undefined, null, ''].includes(state.extra_images) ? [] : state.extra_images;
            current_extra_images = typeof current_extra_images === 'string' ? JSON.parse(current_extra_images) : current_extra_images;

            const updated_extra_images = [...current_extra_images, { image_path: uploaded_image_path, width: width, height: height }];

            console.log(`Pre-Update Extra Images (Next Line):`);
            console.log(current_extra_images);

            update_state_with_callback(
                {
                    extra_images: updated_extra_images,
                    uploaded_image_path: uploaded_image_path,
                    loading: false,
                    uploading: false,
                    resizing: false,
                    uploaded: true,
                },
                async () => {
                    console.log(`Post-Update Extra Images State (Next Line):`);
                    console.log(typeof state.extra_images === 'string' ? JSON.parse(state.extra_images) : state.extra_images);
                },
            );
            return true;
        }

        // Progress Images Update
        if (state.file_upload_type.toString().toLowerCase().includes('progress')) {
            var current_progress_images = [undefined, null, ''].includes(state.progress_images) ? [] : state.progress_images;
            current_progress_images =
                typeof current_progress_images === 'string' ? JSON.parse(current_progress_images) : current_progress_images;

            const updated_progress_images = [...current_progress_images, { image_path: uploaded_image_path, width: width, height: height }];

            console.log(`Pre-Update Progress Images (Next Line):`);
            console.log(current_progress_images);

            update_state_with_callback(
                {
                    progress_images: updated_progress_images,
                    uploaded_image_path: uploaded_image_path,
                    loading: false,
                    uploading: false,
                    resizing: false,
                    uploaded: true,
                },
                async () => {
                    console.log(`Post-Update Progress Images State (Next Line):`);
                    console.log(typeof state.progress_images === 'string' ? JSON.parse(state.progress_images) : state.progress_images);
                },
            );
            return true;
        }

        console.error(`Unknown file upload type: "${state.file_upload_type}"`);
        return false;
    };

    const create_blank_piece = async () => {
        var new_piece_list = state.piece_list;
        new_piece_list.push({
            id: -2,
            o_id: -2,
            class_name: 'temp',
            title: 'temp',
            image_path: '/create_new_piece_primary_secondary.png',
            width: 1200,
            height: 1200,
            description: '',
            piece_type: 'Intaglio On Paper',
            sold: 'True',
            price: 0,
            instagram: '',
            real_width: 0,
            real_height: 0,
            active: 'True',
            framed: 'False',
            comments: '',
            uploaded_image_path: '',
            extra_images: [],
            progress_images: [],
            file_upload_type: 'cover',
        });

        var new_current_image_array = await create_image_array(new_piece_list, new_piece_list.length - 1, -2, true);

        var blank_piece_state = {
            uploaded: false,
            upload_error: false,
            uploaded_image_path: '',
            current_image_array: new_current_image_array,
            extra_images: [],
            progress_images: [],
            piece_list: new_piece_list,
            piece_position: new_piece_list.length - 1,
            title: 'Enter Title...',
            description: 'Enter Description...',
            sold: 'False',
            price: 9999,
            width: 1200,
            height: 1200,
            real_width: 0,
            real_height: 0,
            image_path: '/create_new_piece_primary_secondary.png',
            instagram: '',
            theme: 'None',
            available: 'True',
            framed: 'False',
            comments: '',
            staging_db_id: -2,
            new_piece_created: true,
        };

        console.log('Updating state with BLANK piece details (Next Line):');
        console.log(blank_piece_state);

        update_state(blank_piece_state);
    };

    const handleImageReorder = async (index, direction, image_type_to_edit) => {
        var new_images =
            image_type_to_edit == 'extra_images'
                ? typeof state.extra_images === 'string'
                    ? JSON.parse(state.extra_images)
                    : state.extra_images
                : typeof state.progress_images === 'string'
                ? JSON.parse(state.progress_images)
                : state.progress_images;
        let newIndex;

        if (direction === 'up') {
            newIndex = index === new_images.length - 1 ? 0 : index + 1;
        } else {
            newIndex = index === 0 ? new_images.length - 1 : index - 1;
        }

        let temp = new_images[newIndex];
        new_images[newIndex] = new_images[index];
        new_images[index] = temp;

        update_state({ [image_type_to_edit]: new_images });

        console.log(`Updating DB with Extra Images: ${new_images}`);

        // Call API to update the extra images order for the specific piece id.
        await updateExtraImagesOrder(state.db_id, new_images, image_type_to_edit);
    };

    const handleImageDelete = async (index, image_type_to_edit) => {
        var new_images =
            image_type_to_edit == 'extra_images'
                ? typeof state.extra_images === 'string'
                    ? JSON.parse(state.extra_images)
                    : state.extra_images
                : typeof state.progress_images === 'string'
                ? JSON.parse(state.progress_images)
                : state.progress_images;

        let new_images_filtered = new_images.filter((_, i) => i !== index);
        update_state({ [image_type_to_edit]: new_images_filtered });

        console.log(`Updating DB with Extra Images: ${new_images_filtered}`);

        // Call API to delete the extra image for the specific piece id.
        await updateExtraImagesOrder(state.db_id, new_images_filtered, image_type_to_edit);
    };

    const create_error_message_jsx = () => {
        logger.extra(`Loading: ${state.loading} | updated: ${state.updated} | Error: ${state.error} | Uploaded: ${state.uploaded}`);

        var message_jsx = null;
        var message = '';
        var message_type = null;

        if (state.loading == true) {
            message_type = 'Update';
            message_jsx = (
                <div className={form_styles.error_message_container}>
                    <CircularProgress color="inherit" className={form_styles.loader} />
                    <div className={form_styles.error_message}>{'Re-Loading piece list...'}</div>
                </div>
            );
        } else if (state.updating == true) {
            message_type = 'Update';
            message_jsx = (
                <div className={form_styles.error_message_container}>
                    <CircularProgress color="inherit" className={form_styles.loader} />
                    <div className={form_styles.error_message}>{'Updating piece info in DB...'}</div>
                </div>
            );
        } else if (state.resizing == true) {
            message_type = 'Update';
            message_jsx = (
                <div className={form_styles.error_message_container}>
                    <CircularProgress color="inherit" className={form_styles.loader} />
                    <div className={form_styles.error_message}>{'Resizing Image...'}</div>
                </div>
            );
        } else if (state.uploading == true) {
            message_type = 'Update';
            message_jsx = (
                <div className={form_styles.error_message_container}>
                    <CircularProgress color="inherit" className={form_styles.loader} />
                    <div className={form_styles.error_message}>{'Uploading piece to Amazon S3 Bucket...'}</div>
                </div>
            );
        } else if (state.updated == true) {
            message_type = 'Update';
            message = `Piece Details Update was successful!`;
        } else if (state.uploaded == true) {
            message_type = 'Update';
            message = `Piece Details Upload was successful!`;
        } else if (state.error == true) {
            message_type = 'Error';
            message = `Piece Details Update was NOT successful...`;
        } else if (state.upload_error == true) {
            message_type = 'Error';
            message = `Error reached while uploading image...`;
        } else if (state.width != '' && state.height != '' && state.width > 1920 && state.height > 1920) {
            message_type = 'Warning';
            message = `Image upload successful but image resolution is too high!  Re-Upload with width / height <= 1920px`;
        } else if (state.width != '' && state.height != '' && state.width < 800 && state.height < 800) {
            message_type = 'Warning';
            message = `Image upload successful but image resolution is low!  Re-Upload with width / height >= 800px`;
        } else if (state.uploaded == true) {
            message_type = 'Update';
            message = `Image Upload was successful...`;
        }

        var message_class =
            message_type == 'Update'
                ? form_styles.submit_label_update
                : message_type == 'Warning'
                ? form_styles.submit_label_warning
                : form_styles.submit_label_failed;

        var error_message_and_label_jsx =
            message_type == null ? null : (
                <div className={form_styles.error_message_and_label_container}>
                    <div className={`${form_styles.error_message_label} ${message_class}`}>{`${message_type}:`}</div>
                    <div className={`${form_styles.error_message} ${message_class}`}>{message_jsx == null ? message : message_jsx}</div>
                </div>
            );

        return error_message_and_label_jsx;
    };

    // Start building render
    const styles = state.window_width > 1000 ? desktop_styles : mobile_styles;

    const using_theme = [undefined, null, ''].includes(state.theme) == false ? state.theme : 'None';
    logger.extra(`Theme: ${using_theme} | Framed: ${state.framed} | Sold: ${state.sold}`);

    logger.section(`Creating Initial Image arrays`);
    console.log(`Cover Image Path: ${state.image_path}`);

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
        <div className={styles.loader_container}>
            <div>Loading Gallery</div>
            <CircularProgress color="inherit" className={styles.loader} />
        </div>
    );

    var extra_images_length = [null, undefined].includes(state.extra_image_array) ? null : state.extra_image_array.length;
    console.log(`Extra Images Length: ${extra_images_length} | Selected Gallery Image: ${state.selected_gallery_image}`);

    console.log('Current Image Array: ', state.current_image_array);
    const main_image =
        state.selected_gallery_image === 0
            ? state.current_image_array
            : state.selected_gallery_image < extra_images_length + 1
            ? state.extra_image_array
            : state.progress_image_array;
    console.log('Using main image: ', main_image);

    // Main Image Container JSX
    const image_container_jsx = (
        <div className={styles.centered_image_container}>{state.loading === true ? image_loader_container_jsx : main_image}</div>
    );

    const extra_images_gallery_container_jsx =
        state.loading == true ? null : [null, undefined].includes(using_extra_images) ? null : using_extra_images.length < 1 ? null : (
            <div className={styles.extra_images_gallery_container}>
                {state.loading == true
                    ? null
                    : using_extra_images.map((image, index) => {
                          var image_path = image.image_path.split('/').slice(-2).join('/');
                          console.log(`Extra Images Path: ${image_path} | Width: ${image.width} | Height: ${image.height}`);
                          return (
                              <div
                                  className={`h-full w-full justify-center ${
                                      state.selected_gallery_image === index + 1 ? 'rounded-md bg-tertiary' : ''
                                  }`}
                              >
                                  <div
                                      className={`h-full w-full`}
                                      onClick={async () => {
                                          const extra_image_array = await create_extra_image_array(state.extra_images, index);
                                          update_state({ selected_gallery_image: index + 1, extra_image_array: extra_image_array });
                                      }}
                                  >
                                      <CustomNextImage
                                          className={'h-full w-full'}
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
        );

    const main_image_gallery_container_jsx =
        extra_images_gallery_container_jsx == null ? null : (
            <div className={styles.extra_images_gallery_container}>
                <div className={`flex h-full w-full justify-center ${state.selected_gallery_image === 0 ? 'rounded-md bg-tertiary' : ''}`}>
                    <div
                        className={`${styles.extra_images_gallery_image} ${styles.centered_image_container}`}
                        onClick={() => {
                            update_state({ selected_gallery_image: 0 });
                        }}
                    >
                        <CustomNextImage
                            className={'h-full w-full'}
                            src={
                                state.image_path.includes(PROJECT_CONSTANTS.AWS_BUCKET_URL)
                                    ? image_path
                                    : `${PROJECT_CONSTANTS.AWS_BUCKET_URL}/${image_path}`
                            }
                            alt={``}
                            width={state.width}
                            height={state.height}
                            quality={100}
                        />
                    </div>
                </div>
            </div>
        );

    const main_image_and_extra_images_gallery_container_jsx =
        extra_images_gallery_container_jsx == null ? null : (
            <div className={styles.full_gallery_container}>
                {main_image_gallery_container_jsx}

                {extra_images_gallery_container_jsx}
            </div>
        );

    const final_image_container_jsx =
        extra_images_gallery_container_jsx == null ? (
            <div className={styles.main_image_only_container}>{image_container_jsx}</div>
        ) : (
            <div className={styles.main_image_and_extra_images_container}>
                {image_container_jsx}
                {main_image_and_extra_images_gallery_container_jsx}
            </div>
        );

    const progress_images_gallery_container_jsx =
        state.loading == true ? null : [null, undefined].includes(using_progress_images) ? null : using_progress_images.length <
          1 ? null : (
            <div className={styles.full_gallery_panel}>
                <div className={styles.full_gallery_panel_header}>Pictures of piece in progress:</div>
                <div className={styles.full_gallery_panel_body}>
                    <div className={styles.full_gallery_container}>
                        <div className={styles.extra_images_gallery_container}>
                            {state.loading == true
                                ? null
                                : using_progress_images.map((image, index) => {
                                      var image_path = image.image_path.split('/').slice(-2).join('/');
                                      logger.extra(`Path: ${image_path} | Width: ${image.width} | Height: ${image.height}`);
                                      return (
                                          <div
                                              className={`flex h-full w-full justify-center ${
                                                  state.selected_gallery_image === index + using_extra_images.length + 1
                                                      ? 'rounded-md bg-tertiary'
                                                      : ''
                                              }`}
                                          >
                                              <div
                                                  className={`h-full w-full`}
                                                  onClick={async () => {
                                                      const progress_image_array = await create_extra_image_array(
                                                          state.progress_images,
                                                          index,
                                                      );
                                                      update_state({
                                                          selected_gallery_image: index + using_extra_images.length + 1,
                                                          progress_image_array: progress_image_array,
                                                      });
                                                  }}
                                              >
                                                  <CustomNextImage
                                                      className={'h-full w-full'}
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
            </div>
        );

    // Backwards Title Arrow JSX
    const backward_title_arrow_jsx = (
        <ArrowForwardIosRoundedIcon
            className={`${title_styles.title_arrow} ${title_styles.img_hor_vert}`}
            onClick={(e) => {
                e.preventDefault();
                update_current_piece(state.piece_list, state.next_oid);
            }}
        />
    );

    // Forwards Title Arrow JSX
    const forward_title_arrow_jsx = (
        <ArrowForwardIosRoundedIcon
            className={title_styles.title_arrow}
            onClick={(e) => {
                e.preventDefault();
                update_current_piece(state.piece_list, state.last_oid);
            }}
        />
    );

    // Title Input Textbox JSX
    const title_input_textbox_jsx = (
        <input
            type="text"
            className={title_styles.title_input}
            id="title"
            value={state.title}
            key={'title'}
            onChange={(e) => {
                e.preventDefault();
                update_state({ title: e.target.value });
            }}
        />
    );

    // Button to go back to Details Page for current piece
    const back_to_details_button_jsx = (
        <div className={title_styles.back_to_details_container}>
            <PageviewIcon
                className={title_styles.back_to_details_icon}
                onClick={(e) => {
                    e.preventDefault();
                    props.router.push(`/details/${state.url_o_id}`);
                }}
            />
        </div>
    );

    // Full Title Container JSX
    const title_container_jsx = (
        <div className={title_styles.title_container}>
            {backward_title_arrow_jsx}
            {title_input_textbox_jsx}
            {back_to_details_button_jsx}
            {forward_title_arrow_jsx}
        </div>
    );

    const error_message_jsx = create_error_message_jsx();

    console.log('Extra Images: ', using_extra_images);
    const extra_images_text_jsx = [undefined, null, '', [], ['']].includes(using_extra_images) ? null : using_extra_images.length <
      1 ? null : (
        <div className={edit_details_styles.extra_images_container}>
            <div className={edit_details_styles.extra_image_table_header}>Extra Images:</div>

            <div className={edit_details_styles.extra_image_table} id={'extra-images'}>
                {using_extra_images.map((image, index) => {
                    // console.log(image)
                    // console.log(`Image Path: ${image.image_path}`)
                    var image_path = image.image_path.split('/').slice(-2).join('/');
                    return (
                        <div key={index} className={edit_details_styles.image_row}>
                            <div className={edit_details_styles.image_filename}>{image_path}</div>
                            <div className={edit_details_styles.image_dimensions}>Width: {image.width}px</div>
                            <div className={edit_details_styles.image_dimensions}>Height: {image.height}px</div>
                            <div className={edit_details_styles.button_container}>
                                <ArrowForwardIosRoundedIcon
                                    className={edit_details_styles.up_arrow}
                                    onClick={() => handleImageReorder(index, 'up', 'extra_images')}
                                />
                                <ArrowForwardIosRoundedIcon
                                    className={edit_details_styles.down_arrow}
                                    onClick={() => handleImageReorder(index, 'down', 'extra_images')}
                                />
                                <DeleteForeverIcon
                                    className={edit_details_styles.delete_icon}
                                    onClick={() => handleImageDelete(index, 'extra_images')}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    console.log('Progress Images: ', using_progress_images);
    const progress_images_text_jsx = [undefined, null, '', [], ['']].includes(using_progress_images) ? null : using_progress_images.length <
      1 ? null : (
        <div className={edit_details_styles.extra_images_container}>
            <div className={edit_details_styles.extra_image_table_header}>Progress Images:</div>

            <div className={edit_details_styles.extra_image_table} id={'progress-images'}>
                {using_progress_images.map((image, index) => {
                    var image_path = image.image_path.split('/').slice(-2).join('/');
                    return (
                        <div key={index} className={edit_details_styles.image_row}>
                            <div className={edit_details_styles.image_filename}>{image_path}</div>
                            <div className={edit_details_styles.image_dimensions}>Width: {image.width}px</div>
                            <div className={edit_details_styles.image_dimensions}>Height: {image.height}px</div>
                            <div className={edit_details_styles.button_container}>
                                <ArrowForwardIosRoundedIcon
                                    className={edit_details_styles.up_arrow}
                                    onClick={() => handleImageReorder(index, 'up', 'progress_images')}
                                />
                                <ArrowForwardIosRoundedIcon
                                    className={edit_details_styles.down_arrow}
                                    onClick={() => handleImageReorder(index, 'down', 'progress_images')}
                                />
                                <DeleteForeverIcon
                                    className={edit_details_styles.delete_icon}
                                    onClick={() => handleImageDelete(index, 'progress_images')}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const edit_form = (
        <EditForm
            state={state}
            setState={setState}
            load_changed_images={load_changed_images}
            fetch_pieces_from_api={fetch_pieces_from_api}
            title_container_jsx={title_container_jsx}
            progress_images_text_jsx={progress_images_text_jsx}
            extra_images_text_jsx={extra_images_text_jsx}
            error_message_jsx={error_message_jsx}
            progress_images_gallery_container_jsx={progress_images_gallery_container_jsx}
        />
    );

    console.log('Returning JSX with window width: ' + state.window_width);
    console.log(
        `Clerk User Loaded: ${isLoaded} | Signed In: ${isSignedIn} | User Role: ${
            (user && user.publicMetadata?.role?.toLowerCase()) || 'none'
        }`,
    );
    if (!isLoaded) {
        return <div>Loading...</div>;
    }
    if (!isSignedIn) {
        console.log('User is not signed in.  Redirecting to signin page...');
        return router.push('/signin');
    }
    if (!user || user.publicMetadata?.role?.toLowerCase() != 'admin') {
        console.log(`Current user is not admin - Role: ${user.publicMetadata?.role?.toLowerCase() || 'none'}`);
        return router.push('/signin');
    }

    if (state.window_width > 1000) {
        console.log('Rendering edit page for desktop screen size...');
        return (
            <>
                <div className={'flex h-[calc(100vh-100px)] w-full flex-col md:flex-row'}>
                    <div className={'md:w-2/3'}>{final_image_container_jsx}</div>
                    <div className={'md:w-1/3'}>{edit_form}</div>
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
    }
    return (
        <>
            <div className={styles.details_container}>
                {final_image_container_jsx}
                {edit_form}
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

export default Edit;
