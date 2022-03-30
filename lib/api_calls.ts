async function demote_user(id: string, refresh_data: Function) {
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

async function promote_user(id: string, refresh_data: Function) {
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

async function delete_user(id: string, refresh_data: Function) {
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
    delete_user
}