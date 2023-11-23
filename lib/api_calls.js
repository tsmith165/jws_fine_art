import FileSaver from 'file-saver';
import axios from 'axios';

const server_addr = process.env.NODE_ENV == 'development' ? 'http://localhost:3000' : '';

async function fetch_pieces(theme = 'None', format = 'none') {
    console.log(`Fetching all pieces`);

    const api_call_data = {
        theme: theme,
        format: format
    };
    
    try {
        const response = await axios.post(`${server_addr}/api/pieces`, api_call_data);
        
        if (format !== 'xlsx') {
            const pieces = response.data.pieces;
            console.log('Fetch all pieces Response:', pieces);
            return pieces;
        } else {
            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            FileSaver.saveAs(blob, 'Pieces.xlsx');
            return true;
        }
    } catch (error) {
        console.error('Fetch all pieces api call failure:', error);
    }
}

async function fetch_most_recent_piece() {
    console.log(`Fetching most recent piece`);

    try {
        const response = await axios.post(`${server_addr}/api/recent`);
        const piece = response.data.piece;
        console.log('Fetch most recent piece:', piece);
        return piece;
    } catch (error) {
        console.error('Fetch most recent piece api call failure:', error);
    }
}

async function edit_details(details) {
    const {
        id, title, description, piece_type, sold, price, instagram, width, height, real_width, real_height, theme, available, framed, comments, image_path, extra_images, progress_images,
    } = details;

    console.log(`Editing Details for piece ${id}...`);

    const api_call_data = {
        title: title,
        width: parseInt(width),
        height: parseInt(height),
        description: description,
        piece_type: piece_type,
        sold: sold === 'Sold',
        price: parseInt(price),
        real_width: parseInt(real_width),
        real_height: parseInt(real_height),
        instagram: instagram.split('/').pop(),
        theme: theme.replace('None, ', ''),
        available: available === 'True',
        framed: framed === 'True',
        comments: comments,
        image_path: image_path,
        extra_images: extra_images,
        progress_images: progress_images,
    };

    try {
        const api_call_url = `${server_addr}/api/edit/${id}`;
        console.log(`Edit Details API Call URL: ${api_call_url}`)

        const response = await axios.post(api_call_url, api_call_data);
        console.log('Edit Piece Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Edit Details api call failure:', error);
    }
}

async function create_piece(details) {
    const {
        title, description, piece_type, sold, price, instagram, width, height, real_width, real_height, image_path, theme, available, framed, comments,
    } = details;

    const api_call_data = {
        title: title,
        image_path: image_path,
        width: parseInt(width),
        height: parseInt(height),
        description: description,
        piece_type: piece_type,
        sold: sold === 'Sold',
        price: parseInt(price),
        real_width: parseInt(real_width),
        real_height: parseInt(real_height),
        active: true,
        instagram: instagram.split('/').pop(),
        theme: theme.replace('None, ', ''),
        available: available === 'True',
        framed: framed === 'True',
        comments: comments
    };

    try {
        const response = await axios.post(`${server_addr}/api/create`, api_call_data);
        console.log('Create Piece Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Create Piece api call failure:', error);
    }
}

async function change_order(curr_id_list, swap_id_list) {
    console.log(`Changing Order For Curr ID List: ${curr_id_list} | Swap Id List: ${swap_id_list}`);

    const api_call_data = {
        curr_id_list: curr_id_list,
        swap_id_list: swap_id_list
    };

    try {
        const response = await axios.post(`${server_addr}/api/manage/order`, api_call_data);
        console.log('Change Order Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Change Order api call failure:', error);
    }
}

async function delete_piece(id) {
    console.log(`Deleting Piece For id: ${id}`);

    try {
        const response = await axios.post(`${server_addr}/api/manage/delete/${id}`);
        console.log('Deleting Piece Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Deleting Piece api call failure:', error);
    }
}

async function get_upload_url(image_name, image_type) {
    console.log(`Getting S3 Upload URL for Image Name: ${image_name}`);

    const api_call_data = {
        image_name: image_name,
        image_type: image_type
    };

    try {
        const response = await axios.post(`${server_addr}/api/upload/url`, api_call_data);
        return response.data.url;
    } catch (error) {
        console.error('Get Upload URL api call failure:', error);
    }
}

async function upload_image(upload_url, selected_file) {
    console.log(`Uploading Image to S3 URL: ${upload_url}`);

    try {
        await axios.put(upload_url, selected_file, {
            headers: {
                'Content-Type': 'image/jpeg'
            }
        });
        const image_url = upload_url.split('?')[0];
        console.log(`Uploaded Image URL: ${image_url}`);
        return image_url;
    } catch (error) {
        console.error('Uploading Image api call failure:', error);
    }
}

async function create_stripe_checkout_session(piece_db_id, piece_o_id, piece_title, image_path, width, height, price, full_name, phone, email, address, international) {
    const api_call_data = {
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
        international: international
    };

    try {
        const response = await axios.post(`${server_addr}/api/checkout/session`, api_call_data);
        console.log('Create Stripe Session Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Create Stripe Checkout Session api call failure:', error);
    }
}

async function create_pending_transaction(piece_db_id, piece_title, full_name, phone, email, address, international) {
    const api_call_data = {
        piece_db_id: piece_db_id,
        piece_title: piece_title,
        full_name: full_name,
        phone: phone,
        email: email,
        address: address,
        international: international
    };
    console.log("Passing in this data to create pending transaction:", api_call_data)

    try {
        const response = await axios.post(`${server_addr}/api/checkout/pending`, api_call_data);
        console.log('Create Pending Transaction Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Create Pending Transaction api call failure:', error);
    }
}

async function get_analytics_data(startDate = '', endDate = '', metrics = '', dimensions = '') {
    console.log(`Fetching analytics data`);

    const api_call_data = {
        startDate: startDate,
        endDate: endDate,
        metrics: metrics,
        dimensions: dimensions
    };

    try {
        const response = await axios.post(`${server_addr}/api/analytics`, api_call_data);
        console.log('Get Analytics Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Fetch analytics api call failure:', error);
    }
}

async function updateExtraImagesOrder(data) {
    const {
        piece_id, new_images, image_type_to_edit
    } = data;

    const api_call_data = {
        piece_id: piece_id,
        [image_type_to_edit]: new_images,
        image_type_to_edit: image_type_to_edit
    };

    try {
        const response = await axios.put(`${server_addr}/api/edit/extra/reorder`, api_call_data);
        console.log('Update Image Order Response:', response.data);
        return response.data;
    } catch (error) {
        console.error(`Error updating ${image_type_to_edit} images order:`, error);
    }
}

async function deleteExtraImage(data) {
    const {
        piece_id, index_to_delete, image_type_to_edit
    } = data;

    const api_call_data = {
        piece_id: piece_id,
        index_to_delete: index_to_delete,
        image_type_to_edit: image_type_to_edit
    };

    try {
        const response = await axios.delete(`${server_addr}/api/edit/extra/delete`, { data: api_call_data });
        console.log(`Delete Image ${piece_id} Response:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`Error deleting ${image_type_to_edit} image:`, error);
    }
}

async function fetchDiscountRate() {
    try {
        const response = await axios.post('/api/discount-rate');
        console.log('Fetch Discount Rate Response:', response.data)
        console.log('Discount Rate:', response.data.discountRate)
        if (response.data.discountRate === undefined) {
            return 0.0;
        } 
        return response.data.discountRate;
    } catch (error) {
        console.error("Error fetching discount rate:", error);
        return 0.0;
    }
}

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
    fetchDiscountRate
};
