import React from 'react';

import { edit_details, create_piece, upload_image, get_upload_url } from '@/lib/api_calls';

import InputComponent from '@/components/wrappers/InputComponent';

const EditForm = ({
    state,
    setState,
    load_changed_images,
    fetch_pieces_from_api,
    title_container_jsx,
    progress_images_text_jsx,
    extra_images_text_jsx,
    error_message_jsx,
    progress_images_gallery_container_jsx,
<<<<<<< HEAD
=======
    create_blank_piece
>>>>>>> 818b29b7fa79234a1f62f780c22e09f7703a595c
}) => {
    const update_field_value = async (field, new_value_object) => {
        const key_name = field.toLowerCase();
        const new_value = typeof new_value_object === 'string' ? new_value_object : new_value_object.value;
        console.log(`Setting state on key: ${key_name} | Value: ${new_value}`);

        setState(
            (prevState) => ({ ...prevState, [key_name]: new_value }),
            () => {
                console.log(`Updated key value: ${state[key_name]}`);
            },
        );
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        update_state({ updating: true, updated: false });

        if (!title) {
            update_state({ updating: false, error: true });
            return;
        }

        logger.section({ message: 'Attempting To Edit Piece Details' });
        console.log(
            `Editing Piece DB ID: ${state.db_id} | Title: ${state.title} | Sold: ${state.sold} |` +
                `Framed: ${state.framed} | Piece Type: ${state.piece_type} | Price: ${state.price} |` +
                `Image Path: ${state.image_path} | Description: ${state.description} | Instagram: ${state.instagram}`,
        );
        console.log(`EDITING PIECE WITH FILE UPLOAD TYPE: ${state.file_upload_type}`);

        if (state.new_piece_created) {
            logger.section({ message: 'Attempting To Create New Piece' });
            console.log(`Creating piece with Title: ${title} | Sold: ${sold} | Price: ${price} | Image Path: ${state.image_path}`);
            const response = await create_piece({
                title: state.title,
                description: state.description,
                piece_type: state.piece_type,
                sold: state.sold,
                price: state.price,
                instagram: state.instagram,
                width: state.width,
                height: state.height,
                real_width: state.real_width,
                real_height: state.real_height,
                image_path: state.image_path,
                theme: state.theme,
                available: state.available,
                framed: state.framed,
                comments: state.comments,
            });

            console.log(`Create Piece Response (Next Line):`);
            console.log(response);

            if (!response) {
                update_state({ loading: false, updating: false, error: true });
                return;
            }
            await fetch_pieces_from_api('uploaded');
            return;
        }

        const response = await edit_details({
            id: state.db_id,
            title: state.title,
            description: state.description,
            piece_type: state.piece_type,
            sold: state.sold,
            price: state.price,
            instagram: state.instagram,
            width: state.width,
            height: state.height,
            real_width: state.real_width,
            real_height: state.real_height,
            theme: state.theme,
            available: state.available,
            framed: state.framed,
            comments: state.comments,
            image_path: '/' + state.image_path.split('/').slice(-2).join('/'),
            extra_images: JSON.stringify(state.extra_images),
            progress_images: JSON.stringify(state.progress_images),
        });

        console.log(`Edit Piece Response (Next Line):`);
        console.log(response);

        if (!response) {
            console.log('Edit Piece - No Response - Setting error = true');
            update_state({ loading: false, error: true });
            return;
        }

        await fetch_pieces_from_api('updated');
        return;
    };

    const onFileChange = async (event) => {
        event.preventDefault();
        update_state({ loading: false, uploading: false, resizing: true });

        logger.section({ message: 'File Input Change Event Triggered' });

        try {
            var selected_file = event.target.files[0];
            var file_name = selected_file.name.replace(/\s+/g, '_'); // Replace spaces with underscore
            var file_extension = file_name.split('.').pop().toLowerCase();
            var title = state.title.toLowerCase().replace().replace(/\s+/g, '_'); // Replace spaces with underscore

            update_state({ loading: false, uploading: true, resizing: false });

            if (state.file_upload_type === 'extra') {
                let current_index = state.extra_images.length < 1 ? 1 : state.extra_images.length + 1;
                file_name = `${title}_extra_${current_index}`;
                selected_file = await resizeImage(selected_file, 1200, 1200);
                console.log(`Resized ${state.file_upload_type} image: ${selected_file} | Resized Size: ${selected_file.size}`);
            }
            if (state.file_upload_type === 'progress') {
                let current_index = state.progress_images.length < 1 ? 1 : state.progress_images.length + 1;
                file_name = `${title}_progress_${current_index}`;
                selected_file = await resizeImage(selected_file, 1200, 1200);
                console.log(`Resized ${state.file_upload_type} image: ${selected_file} | Resized Size: ${selected_file.size}`);
            }
            if (state.file_upload_type === 'cover') {
                file_name = `${title}`;
                selected_file = await resizeImage(selected_file, 1920, 1920);
                console.log(`Resized ${state.file_upload_type} image: ${selected_file} | Resized Size: ${selected_file.size}`);
            }

            const pre_update_image_filename = state.image_path.split('/').pop();
            console.log(`Pre-Update FileName: ${pre_update_image_filename} | Current FileName: ${file_name}`);
            if (pre_update_image_filename.includes(file_name)) {
                var current_index = 1;
                if (pre_update_image_filename.includes('update_')) {
                    current_index = parseInt(pre_update_image_filename.split('update_').pop()) + 1;
                }
                file_name = `${file_name}-update_${current_index}`;
            }

            const file_name_with_extension = `${file_name}.${file_extension}`;

            const s3_upload_url = await get_upload_url(file_name_with_extension, state.file_upload_type);
            console.log(`Got Upload URL: ${s3_upload_url}`);

            var uploaded_image_path = await upload_image(s3_upload_url, selected_file);
            console.log(`Got Upload Reponse: ${uploaded_image_path}`);

            update_state({ loading: true, uploading: false, resizing: false });
            load_changed_images(uploaded_image_path);
        } catch (err) {
            update_state({ uploaded: false, upload_error: true, loading: true, uploading: false, resizing: false });
            console.error(`S3 Image Upload Error: ${err.message}`);
            return false;
        }
    };

    const handle_multi_select_change = (new_selected_options) => {
        console.log(`New theme passed (Next Lines):`);
        //console.log(new_selected_options)
        var theme_string = '';
        var final_options = [];
        for (var option_index in new_selected_options) {
            let options = new_selected_options[option_index];
            console.log(options);
            if (options.value != 'None') {
                theme_string += `${options.value}, `;
                final_options.push(options);
            }
        }
        theme_string = theme_string == '' ? 'None' : theme_string;
        logger.extra(`Setting theme: ${theme_string}`);
        update_state({ theme: theme_string, theme_options: final_options });
    };

    const resizeImage = async (file, maxWidth, maxHeight) => {
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.onload = function () {
                let canvas = document.createElement('canvas');
                let ctx = canvas.getContext('2d');
                let scale = Math.min(maxWidth / width, maxHeight / height);
                canvas.width = width * scale;
                canvas.height = height * scale;
                ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(resolve, 'image/jpeg', 1);
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    };

    const showFileUpload = (event) => {
        event.preventDefault();
        file_input_ref.current.click();
    };

    // Refrences
    const file_input_ref = React.createRef(null);
    const text_area_ref = React.createRef(null);

    const description_text_area_jsx = (
        <div className={'flex h-fit w-full px-4 py-1'}>
            <InputComponent
                input_type={'input_textarea'}
                split={false}
                value={state.description}
                name={'Description'}
                update_field_value={update_field_value}
            />
        </div>
    );

    const theme_multiselect_jsx = (
        <div className={'flex h-fit w-full px-4 py-1'}>
            <InputComponent
                input_type="input_multiselect"
                name="Theme"
                value={state.theme_options}
                handle_multi_select_change={handle_multi_select_change}
                select_options={[
                    ['Water', 'Water'],
                    ['Snow', 'Snow'],
                    ['Mountains', 'Mountains'],
                    ['Landscape', 'Landscape'],
                    ['City', 'City'],
                    ['Portrait', 'Portrait'],
                    ['Black and White', 'Black and White'],
                    ['Abstract', 'Abstract'],
                    ['None', 'None'],
                ]}
            />
        </div>
    );

    const piece_type_select_jsx = (
        <div className={'flex h-fit w-full px-4 py-1'}>
            <InputComponent
                input_type={'input_select'}
                split={false}
                value={state.piece_type}
                name={'Type'}
                id={'piece_type'}
                update_field_value={update_field_value}
                select_options={[
                    ['Oil On Canvas', 'Oil On Canvas'],
                    ['Oil On Cradled Panel', 'Oil On Cradled Panel'],
                    ['Intaglio On Paper', 'Intaglio On Paper'],
                    ['Linocut On Paper', 'Linocut On Paper'],
                    ['Pastel On Paper', 'Pastel On Paper'],
                ]}
            />
        </div>
    );

    const available_and_sold_container_jsx = (
        <div className={'flex h-fit w-full px-4 py-1'}>
            <InputComponent
                input_type={'input_select'}
                split={true}
                value={state.available}
                name={'Available'}
                update_field_value={update_field_value}
                select_options={[
                    ['True', 'True'],
                    ['False', 'False'],
                ]}
            />
            <InputComponent
                input_type={'input_select'}
                split={true}
                value={state.sold}
                name={'Sold'}
                update_field_value={update_field_value}
                select_options={[
                    ['True', 'Sold'],
                    ['False', 'Not Sold'],
                ]}
            />
        </div>
    );

    const instagram_and_price_container_jsx = (
        <div className={'flex h-fit w-full px-4 py-1'}>
            <InputComponent
                input_type={'input_textbox'}
                split={true}
                value={state.instagram}
                name={'Instagram'}
                update_field_value={update_field_value}
            />

            <InputComponent
                input_type={'input_textbox'}
                split={true}
                value={state.price}
                name={'Price'}
                update_field_value={update_field_value}
            />
        </div>
    );

    const real_width_and_height_container_jsx = (
        <div className={'flex h-fit w-full px-4 py-1'}>
            <InputComponent
                input_type={'input_textbox'}
                split={true}
                value={state.real_width}
                id={'real_width'}
                name={'Width'}
                update_field_value={update_field_value}
            />

            <InputComponent
                input_type={'input_textbox'}
                split={true}
                value={state.real_height}
                id={'real_height'}
                name={'Height'}
                update_field_value={update_field_value}
            />
        </div>
    );

    const px_width_and_height_container_jsx = (
        <div className={'flex h-fit w-full px-4 py-1'}>
            <InputComponent
                input_type={'input_textbox'}
                split={true}
                value={state.width}
                id={'width'}
                name={'PX Width'}
                update_field_value={update_field_value}
            />
            <InputComponent
                input_type={'input_textbox'}
                split={true}
                value={state.height}
                id={'height'}
                name={'PX Height'}
                update_field_value={update_field_value}
            />
        </div>
    );

    const framed_and_comments_container_jsx = (
        <div className={'flex h-fit w-full px-4 py-1'}>
            <InputComponent
                input_type={'input_select'}
                split={true}
                value={state.framed}
                name={'Framed'}
                update_field_value={update_field_value}
                select_options={[
                    ['True', 'True'],
                    ['False', 'False'],
                ]}
            />
            <InputComponent
                input_type={'input_textarea'}
                split={true}
                value={state.comments}
                name={'Comments'}
                update_field_value={update_field_value}
                rows={2}
            />
        </div>
    );

    const file_input_continer = (
        <div className={'flex h-fit w-full px-4 py-1'}>
            <InputComponent
                input_type={'input_file'}
                split={false}
                value={state.framed}
                name={'Upload'}
                id={'upload_type'}
                update_field_value={update_field_value}
                file_upload_type={state.file_upload_type}
                uploaded_image_path={state.uploaded_image_path}
                showFileUpload={showFileUpload}
                onFileChange={onFileChange}
                file_types={[
                    { value: 'cover', label: 'Cover Image' },
                    { value: 'extra', label: 'Extra Image' },
                    { value: 'progress', label: 'Progress Image' },
                ]}
            />
        </div>
    );

    const submit_button_classes =
        'rounded-md border-2 border-secondary bg-primary px-3 py-1 font-bold text-dark hover:border-primary hover:bg-dark hover:text-primary';
    const submit_container_jsx = (
<<<<<<< HEAD
        <div className={'flex flex-row px-4 py-2'}>
=======
        <div className={'flex flex-row px-4 py-2 space-x-2.5'}>
>>>>>>> 818b29b7fa79234a1f62f780c22e09f7703a595c
            {/* <button type="button" className={form_styles.upload_button} onClick={showFileUpload}>Upload</button> */}
            {/* <input type="file" className={form_styles.upload_file_input} onChange={onFileChange} ref={file_input_ref}/> */}
            <button type="button" className={submit_button_classes} onClick={handleSubmit}>
                Submit Changes
            </button>
            <button type="button" className={submit_button_classes} onClick={create_blank_piece}>
                Create New Piece
            </button>
        </div>
    );

    return (
<<<<<<< HEAD
        <div className="flex h-full w-full flex-col">
=======
        <div className="flex h-full w-full flex-col overflow-y-auto">
>>>>>>> 818b29b7fa79234a1f62f780c22e09f7703a595c
            <form>
                {title_container_jsx /* Title Container */}
                {file_input_continer /* File Input Container */}
                {submit_container_jsx}
                {error_message_jsx}
                {progress_images_gallery_container_jsx}
<<<<<<< HEAD
                <div className="p-4"></div>
=======
>>>>>>> 818b29b7fa79234a1f62f780c22e09f7703a595c
                {piece_type_select_jsx /* Piece Type Select */}
                {theme_multiselect_jsx /* Theme Multiselect */}
                {available_and_sold_container_jsx /* Split Container For Available / sold */}
                {instagram_and_price_container_jsx /* Split Container For Instagram Link / Available */}
                {real_width_and_height_container_jsx /* Split Container For real_width / real_height */}
                {px_width_and_height_container_jsx /* Split Container For image pixel width / pixel height */}
                {framed_and_comments_container_jsx /* Split Container For framed / comments */}
                {description_text_area_jsx /* Description Text Area */}
                {extra_images_text_jsx}
                {progress_images_text_jsx}
            </form>
        </div>
    );
};

export default EditForm;
