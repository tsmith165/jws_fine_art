async function edit_details(id, title, description, type, sold, price, width, height, refresh_data) {
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

export {
    demote_user,
    promote_user,
    delete_user,
    edit_details
}