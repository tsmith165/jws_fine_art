import { useRouter } from 'next/router'
import { useUser } from "@clerk/clerk-react";
import { useState } from 'react';

import { prisma } from '../../lib/prisma'

import DetailsPage from '../../src/components/pages/details/DetailsPage';

const baseURL = "https://jwsfineartpieces.s3.us-west-1.amazonaws.com";

const AUTH_ENABLED = false;

const Details = ({piece_list, app_state, app_set_state}) => {
    if (AUTH_ENABLED) { 
        const { isLoaded, isSignedIn, user } = useUser();
    }

    const router = useRouter();
    const id = router.query.id;
    console.log(`Page ID: ${id}`);

    // console.log(`Passing piece_list (Next Line): `)
    // console.log(piece_list)

    if (!router.isReady) { return null }
    if (AUTH_ENABLED == false) { 
        return ( <DetailsPage id={id} piece_list={piece_list} app_state={app_state} app_set_state={app_set_state} router={router} isSignedIn={false} user={null}/> )
    }
    if (isLoaded == false) { 
        return ( <DetailsPage id={id} piece_list={piece_list} app_state={app_state} app_set_state={app_set_state} router={router} isSignedIn={false} user={null}/> )
    }
    if ((isSignedIn !== undefined && isSignedIn == true) && (user == undefined || user == null)) { 
        return ( <DetailsPage id={id} piece_list={piece_list} app_state={app_state} app_set_state={app_set_state} router={router} isSignedIn={false} user={null}/> )
    } 
    return ( <DetailsPage id={id} piece_list={piece_list} app_state={app_state} app_set_state={app_set_state} router={router} isSignedIn={isSignedIn} user={user}/> )
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