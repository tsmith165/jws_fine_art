async function edit_details(id, title, description, type, sold, price, width, height, real_width, real_height) {
    console.log(`Editing Details for piece ${id}...`)
  
    try {
      fetch(`/api/edit/${id}`, {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            title: title, 
            description: description.replace("\n", "<br>"), 
            type: type, 
            sold: sold == "Sold" ? true : false, 
            price: parseInt(price), 
            width: parseInt(width), 
            height: parseInt(height),
            real_width: parseInt(real_width),
            real_height: parseInt(real_height)
        })
      }).then(async (res) => {
        await res.json().then( json => {
            console.log(json);
            console.log("Edit Details Complete.")

            console.log("Returning Edit Details - True")
            return true
        })
      })
    } catch (error) {
      console.error("Edit Details api call failure.  (Traceback next line)")
      console.log(error)

      return false
    }
}

async function create_piece(title, description, type, sold, price, real_width, real_height, image_path, width, height) {
    console.log(`Creating Piece with title: ${title}`)
  
    try {
        const response = await fetch(
            `/api/create`, {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    title: title, 
                    description: description.replace("\n", "<br>"), 
                    type: type, 
                    sold: sold == "Sold" ? true : false, 
                    price: parseInt(price), 
                    real_width: parseInt(real_width), 
                    real_height: parseInt(real_height),
                    image_path: image_path,
                    width: parseInt(width), 
                    height: parseInt(height),
                })
            }
        )

        console.log("Craete Piece Response (Next Line):");
        console.log(response);

        return response

    } catch (error) {
      console.error("Edit Details api call failure.  (Traceback next line)")
      console.log(error)

      return false
    }
}

async function change_order(curr_id_list, swap_id_list, refresh_data) {
    console.log(`Changing Order For Curr ID List: ${curr_id_list} | Swap Id List: ${swap_id_list}`)
  
    try {
        const response = await fetch(
            `/api/manage/order`, {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    curr_id_list: curr_id_list, 
                    swap_id_list: swap_id_list 
                })
            }
        )

        console.log("Change Order Response (Next Line):");
        console.log(response);

        refresh_data();


        return response

    } catch (error) {
        console.error("Change Order api call failure.  (Traceback next line)")
        console.log(error)
    }
}

async function delete_piece(id, refresh_data) {
    console.log(`Deleting Piece For id: ${id}`)
  
    try {
        const response = await fetch(
            `/api/manage/delete/${id}`, {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST'
            }
        )

        console.log("Deleting Piece Response (Next Line):");
        console.log(response);

        refresh_data();


        return response

    } catch (error) {
        console.error("Deleting Piece api call failure.  (Traceback next line)")
        console.log(error)
    }
}

async function demote_user(id, refresh_data) {
    console.log(`Demoting User ${id}...`)
  
    try {
        const response = await fetch(
            `/api/user/demote/${id}`, {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST'
            }
        )

        console.log("Demote User Response (Next Line):");
        console.log(response);

        refresh_data();

        return response

    } catch (error) {
        console.error("Demote user api call failure.  (Traceback next line)")
        console.log(error)
    }
}

async function promote_user(id, refresh_data) {
    console.log(`Promoting User ${id}...`)

    try {
        const response = await fetch(
            `/api/user/promote/${id}`, {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST'
            }
        )

        console.log("Promote User Response (Next Line):");
        console.log(response);

        refresh_data();

        return response

    } catch (error) {
    console.error("Demote user api call failure.  (Traceback next line)")
    console.log(error)
    }
}

async function delete_user(id, refresh_data) {
    console.log(`Deleting User ${id}...`)

    try {
        const response = await fetch(
            `/api/user/delete/${id}`, {
                headers: {
                'Content-Type': 'application/json'
                },
                method: 'DELETE'
            }
        )
        
        console.log("Promote User Response (Next Line):");
        console.log(response);

        refresh_data();

        return response
        
    } catch (error) {
    console.error("Demote user api call failure.  (Traceback next line)")
    console.log(error)
    }
}

async function get_upload_url(image_name) {
    console.log(`Getting S3 Upload URL for Image Name: ${image_name}`)

    try {
        const response = await fetch(
            `/api/upload/url`, {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    image_name: image_name
                })
            }
        )

        const url = await response.json()
        return url.url

    } catch (error) {
        console.error("Get Upload URL api call failure.  (Traceback next line)")
        console.log(error)
        return false
    }
}

async function upload_image(upload_url, selected_file) {
    console.log(`Uploading Image to S3 URL: ${upload_url}`)
  
    try {
        const response = await fetch(
            upload_url, {
                headers: {
                    'Content-Type': 'image/jpeg'
                },
                method: 'PUT',
                body: selected_file
            }
        )

        const upload_response = await response
        console.log("Upload Image Response (Next Line):")
        console.log(upload_response)

        const image_url = upload_url.split('?')[0]
        console.log(`Uploaded Image URL: ${image_url}`)

        return image_url

    } catch (error) {
        console.error("Uploading Image api call failure.  (Traceback next line)")
        console.log(error)

        return false
    }
}

async function create_stripe_checkout_session(piece_db_id, piece_title, image_path, width, height, price, full_name, phone, email, address, international) {
    console.log(`Creating Stripe Checkout Session for piece_db_id: ${piece_db_id}`)
  
    try { 
        const response = await fetch(
            `/api/checkout/session`, {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    piece_db_id: piece_db_id, 
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
                })
            }
        )

        console.log("Craete Stripe Session Response (Next Line):");
        console.log(response);

        return response

    } catch (error) {
        console.error("create_stripe_checkout_session api call failure.  (Traceback next line)")
        console.log(error)
  
        return false
    }
}

async function create_pending_transaction(piece_db_id, piece_title, full_name, phone, email, address, international) {
    console.log(`Creating Pending Transaction for piece_db_id: ${piece_db_id}`)
  
    try {
        const response = await fetch(
            `/api/checkout/pending`, {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    piece_db_id: piece_db_id, 
                    piece_title: piece_title, 
                    full_name: full_name, 
                    phone: phone, 
                    email: email, 
                    address: address, 
                    international: international
                })
            }
        )

        console.log("Craete Piece Response (Next Line):");
        console.log(response);

        return response

    } catch (error) {
      console.error("Create Pending Transaction api call failure.  (Traceback next line)")
      console.log(error)

      return false
    }
}

export {
    demote_user,
    promote_user,
    delete_user,
    edit_details,
    get_upload_url,
    upload_image,
    create_piece,
    change_order,
    delete_piece,
    create_pending_transaction,
    create_stripe_checkout_session
}