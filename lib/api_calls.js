import { isConstructorDeclaration } from "typescript";

async function edit_details(id, title, description, type, sold, price, width, height) {
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
            height: parseInt(height)
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
        const response = fetch(
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

        const create_response = await response
        console.log("Craete Piece Response (Next Line):")
        console.log(create_response)

        return create_response

    } catch (error) {
      console.error("Edit Details api call failure.  (Traceback next line)")
      console.log(error)

      return false
    }
}

async function demote_user(id, refresh_data) {
    console.log(`Demoting User ${id}...`)
  
    try {
      fetch(`/api/user/demote/${id}`, {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST'
      }).then((res) => {
        res.json().then( json => {
            console.log(json);
            refresh_data();
        })
      })
    } catch (error) {
      console.error("Demote user api call failure.  (Traceback next line)")
      console.log(error)
    }
}

async function promote_user(id, refresh_data) {
    console.log(`Promoting User ${id}...`)

    try {
    fetch(`/api/user/promote/${id}`, {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST'
    }).then((res) => {
        res.json().then( json => {
            console.log(json);
            refresh_data();
        })
    })
    } catch (error) {
    console.error("Demote user api call failure.  (Traceback next line)")
    console.log(error)
    }
}

async function delete_user(id, refresh_data) {
    console.log(`Deleting User ${id}...`)

    try {
    fetch(`/api/user/delete/${id}`, {
        headers: {
        'Content-Type': 'application/json'
        },
        method: 'DELETE'
    }).then((res) => {
        res.json().then( json => {
            console.log(json);
            refresh_data();
        })
    })
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

export {
    demote_user,
    promote_user,
    delete_user,
    edit_details,
    get_upload_url,
    upload_image,
    create_piece
}