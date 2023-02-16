import { useRouter } from 'next/router'
import { useUser } from "@clerk/clerk-react";
import { useState, useEffect } from 'react';

import { prisma } from '../../lib/prisma'

import DetailsPage from '../../src/components/pages/details/DetailsPage';

const baseURL = "https://jwsfineartpieces.s3.us-west-1.amazonaws.com";

const AUTH_ENABLED = false;

const Details = ({piece_list}) => {
    const [state, setState] = useState({isLoaded: null, isSignedIn: null, user: null, url_id: null});

    const router = useRouter();
    const id = router.query.id;
    console.log(`Page ID: ${id}`);
    
    if (AUTH_ENABLED) { 
        useEffect(() => {
            const { isLoaded, isSignedIn, user } = useUser();
            console.log(`Loaded: ${isLoaded} | Signed in: ${isSignedIn} | User (next line):`)
            console.log((user != null) ? user : `No User`)

            setState({isLoaded: isLoaded, isSignedIn: isSignedIn, user: user})
        }, []);
    }

    // console.log(`Passing piece_list (Next Line): `)
    // console.log(piece_list)

    if (router == null || !router.isReady) { return null }
    if (AUTH_ENABLED == false) { 
        return ( <DetailsPage id={id} piece_list={piece_list} router={router} isSignedIn={false} user={null}/> )
    }
    if (state.isLoaded == false) { 
        return ( <DetailsPage id={id} piece_list={piece_list} router={router} isSignedIn={false} user={null}/> )
    }
    if ((state.isSignedIn !== undefined && state.isSignedIn == true) && (state.user == undefined || state.user == null)) { 
        return ( <DetailsPage id={id} piece_list={piece_list} router={router} isSignedIn={false} user={null}/> )
    } 
    return ( <DetailsPage id={id} piece_list={piece_list} router={router} isSignedIn={state.isSignedIn} user={state.user}/> )
}

export default Details

export const getServerSideProps = async (context) => {
    console.log(`-------------- Fetching Initial Server List --------------`)
    var piece_list = await prisma.piece.findMany()
    piece_list.sort((a, b) => a['o_id'] - b['o_id']);

    return {
      props: {piece_list: piece_list, most_recent_id: piece_list[piece_list.length - 1]['id']}, // will be passed to the page component as props
    }
}