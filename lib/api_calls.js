import FileSaver from 'file-saver';

const server_addr = process.env.NODE_ENV == 'development' ? 'http://localhost:3000' : '';

async function fetch_pieces(theme = 'None', format = 'none') {
    console.log(`Fetching all pieces`);

    try {
        const response = await fetch(`${server_addr}/api/pieces`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({
                theme: theme,
                format: format,
            }),
        });

        if (format != 'xlsx') {
            const response_json = await response.json();
            var pieces = response_json['pieces'];

            console.log('Fetch all pieces Response (Next Line):');
            console.log(pieces);
            return pieces;
        } else {
            console.log(`Waiting for response blob...`);
            const blob = await response.blob();
            console.log(`Got response blob!`);
            console.log(blob);
            FileSaver.saveAs(blob, 'Pieces.xlsx');
            return true;
        }
    } catch (error) {
        console.error('Fetch all pieces api call failure.  (Traceback next line)');
        console.log(error);
    }
}

async function fetch_most_recent_piece() {
    console.log(`Fetching all pieces`);

    try {
        const response = await fetch(`${server_addr}/api/recent`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
        });

        const response_json = await response.json();
        var piece = response_json['piece'];

        console.log('Fetch most recent piece JSON (Next Line):');
        console.log(piece);
        return piece;
    } catch (error) {
        console.error('Fetch all pieces api call failure.  (Traceback next line)');
        console.log(error);
    }
}

async function edit_details({
    id, title, description, piece_type, sold, price, instagram, width, height, real_width, real_height, theme, available, framed, comments, image_path, extra_images, progress_images,
}) {
    console.log(`Editing Details for piece ${id}...`);
    console.log(
        `Setting piece to Sold: ${sold} | Title: ${title} | Piece Type: ${piece_type} | Theme: ${theme} | Available: ${available} | Instagram: ${instagram} | Framed: ${framed} | Comments: ${comments}`
    );
    var instagram_id = instagram;
    if (instagram.includes('/')) {
        var instagram_split = instagram.split('/');
        instagram_id = instagram_split[instagram_split.length - 1];
    }

    description = description === undefined ? '' : description.includes('\n') ? description.split('\n').join('<br>') : description
    comments = comments === undefined ? '' : comments.includes('\n') ? comments.split('\n').join('<br>') : comments

    theme = theme.includes('None,') ? theme.replace('None, ', '') : theme;
    try {
        const response = await fetch(`/api/edit/${id}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({
                title: title,
                width: parseInt(width),
                height: parseInt(height),
                description: description,
                piece_type: piece_type,
                sold: sold == 'Sold' || sold == 'True' ? true : false,
                price: parseInt(price),
                real_width: parseInt(real_width),
                real_height: parseInt(real_height),
                instagram: instagram_id,
                theme: theme,
                available: available == 'True' ? true : false,
                framed: framed == 'True' ? true : false,
                comments: comments,
                image_path: image_path,
                extra_images: extra_images,
                progress_images: progress_images,
            }),
        });

        console.log('Edit Piece Response (Next Line):');
        console.log(response);

        console.log('Returning Edit Piece - True');
        return response;
    } catch (error) {
        console.error('Edit Details api call failure.  (Traceback next line)');
        console.log(error);

        return false;
    }
}

async function create_piece({
    title, description, piece_type, sold, price, instagram, width, height, real_width, real_height, image_path, theme, available, framed, comments,
}) {
    console.log(`Creating Piece with title: ${title}`);
    var instagram_id = '';
    if (instagram.includes('/')) {
        var instagram_split = instagram.split('/');
        instagram_id = instagram_split[instagram_split.length - 1];
    }
    theme = theme.includes('None,') ? theme.replace('None, ', '') : theme;
    description = description === undefined ? '' : description.includes('\n') ? description.split('\n').join('<br>') : ''
    try {
        const response = await fetch(`/api/create`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({
                title: title,
                image_path: image_path,
                width: parseInt(width),
                height: parseInt(height),
                description: description,
                piece_type: piece_type,
                sold: sold == 'Sold' ? true : false,
                price: parseInt(price),
                real_width: parseInt(real_width),
                real_height: parseInt(real_height),
                active: true,
                instagram: instagram_id,
                theme: theme,
                available: available == 'True' ? true : false,
                framed: framed == 'True' ? true : false,
                comments: comments,
            }),
        });

        console.log('Create Piece Response (Next Line):');
        console.log(response);

        return response;
    } catch (error) {
        console.error('Edit Details api call failure.  (Traceback next line)');
        console.log(error);

        return false;
    }
}

async function change_order(curr_id_list, swap_id_list, refresh_data) {
    console.log(`Changing Order For Curr ID List: ${curr_id_list} | Swap Id List: ${swap_id_list}`);

    try {
        const response = await fetch(`/api/manage/order`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({
                curr_id_list: curr_id_list,
                swap_id_list: swap_id_list,
            }),
        });

        console.log('Change Order Response (Next Line):');
        console.log(response);

        return response;
    } catch (error) {
        console.error('Change Order api call failure.  (Traceback next line)');
        console.log(error);
    }
}

async function delete_piece(id, refresh_data) {
    console.log(`Deleting Piece For id: ${id}`);

    try {
        const response = await fetch(`/api/manage/delete/${id}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
        });

        console.log('Deleting Piece Response (Next Line):');
        console.log(response);

        return response;
    } catch (error) {
        console.error('Deleting Piece api call failure.  (Traceback next line)');
        console.log(error);
    }
}

async function get_upload_url(image_name, image_type) {
    console.log(`Getting S3 Upload URL for Image Name: ${image_name}`);

    try {
        const response = await fetch(`/api/upload/url`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({
                image_name: image_name,
                image_type: image_type,
            }),
        });

        const url = await response.json();
        return url.url;
    } catch (error) {
        console.error('Get Upload URL api call failure.  (Traceback next line)');
        console.log(error);
        return false;
    }
}

async function upload_image(upload_url, selected_file) {
    console.log(`Uploading Image to S3 URL: ${upload_url}`);

    try {
        const response = await fetch(upload_url, {
            headers: {
                'Content-Type': 'image/jpeg',
            },
            method: 'PUT',
            body: selected_file,
        });

        const upload_response = await response;
        console.log('Upload Image Response (Next Line):');
        console.log(upload_response);

        const image_url = upload_url.split('?')[0];
        console.log(`Uploaded Image URL: ${image_url}`);

        return image_url;
    } catch (error) {
        console.error('Uploading Image api call failure.  (Traceback next line)');
        console.log(error);

        return false;
    }
}

async function create_stripe_checkout_session(
    piece_db_id,
    piece_o_id,
    piece_title,
    image_path,
    width,
    height,
    price,
    full_name,
    phone,
    email,
    address,
    international,
) {
    console.log(
        `Creating Stripe Checkout Session for piece_db_id: ${piece_db_id} | Checkout Session Data (Next Line): `,
    );
    const checkout_session_data = {
        piece_db_id: piece_db_id,
        piece_o_id: piece_o_id,
        piece_title: piece_title,
        image_path: image_path,
        width: width,
        height: height,
        price: price,
        full_name: full_name,
        phone: phone,
        email: email,
        address: address,
        international: international,
    };
    console.log(checkout_session_data);

    try {
        const response = await fetch(`/api/checkout/session`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify(checkout_session_data),
        });

        console.log('Create Stripe Session Response (Next Line):');
        console.log(response);

        return response;
    } catch (error) {
        console.error('create_stripe_checkout_session api call failure.  (Traceback next line)');
        console.log(error);

        return false;
    }
}

async function create_pending_transaction(piece_db_id, piece_title, full_name, phone, email, address, international) {
    console.log(`Creating Pending Transaction for piece_db_id: ${piece_db_id}`);

    try {
        const response = await fetch(`/api/checkout/pending`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({
                piece_db_id: piece_db_id,
                piece_title: piece_title,
                full_name: full_name,
                phone: phone,
                email: email,
                address: address,
                international: international,
            }),
        });

        console.log('Create Piece Response (Next Line):');
        console.log(response);

        return response;
    } catch (error) {
        console.error('Create Pending Transaction api call failure.  (Traceback next line)');
        console.log(error);

        return false;
    }
}

async function get_analytics_data(startDate = '', endDate = '', metrics = '', dimensions = '') {
    console.log(`Fetching analytics data`);

    try {
        const response = await fetch(`/api/analytics`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({
                startDate: startDate,
                endDate: endDate,
                metrics: metrics,
                dimensions: dimensions,
            }),
        });

        console.log('Get Analytics Response (Next Line):');
        console.log(response);

        return response.json();
    } catch (error) {
        console.error('Fetch analytics api call failure.  (Traceback next line)');
        console.log(error);
    }
}

// Function to update the extra images order
async function updateExtraImagesOrder(piece_id, new_images, image_type_to_edit)  {
    try {
        const response = await fetch(`/api/edit/extra/reorder`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            piece_id: piece_id,
            [image_type_to_edit]: new_images,
            image_type_to_edit: image_type_to_edit,
          }),
        });
    
        console.log('Update Image Order Response (Next Line):');
        console.log(response);

        return response.json();
      } catch (error) {
        console.error(`Error updating ${image_type_to_edit} images order:`, error);
      }
};
  
  // Function to delete an extra image
async function deleteExtraImage(piece_id, index_to_delete, image_type_to_edit) {
    try {
        const response = await fetch(`/api/edit/extra/delete`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                piece_id: piece_id,
                index_to_delete: index_to_delete,
                image_type_to_edit: image_type_to_edit,
            }),
        });

        console.log(`Delete Image ${piece_id} Response (Next Line):`);
        console.log(response);

        return response.json();
    } catch (error) {
        console.error(`Error deleting ${image_type_to_edit} image:`, error);
    }
};

export {
    edit_details,
    get_upload_url,
    upload_image,
    create_piece,
    change_order,
    delete_piece,
    create_pending_transaction,
    create_stripe_checkout_session,
    fetch_pieces,
    fetch_most_recent_piece,
    get_analytics_data,
    updateExtraImagesOrder,
    deleteExtraImage,
};
