import { useRouter } from 'next/router'
import { useUser } from "@clerk/clerk-react";
import { useState } from 'react';

import { prisma } from '../../lib/prisma'

import DetailsPage from '../../src/components/pages/details/DetailsPage';

const baseURL = "https://jwsfineartpieces.s3.us-west-1.amazonaws.com";

const Details = ({piece_list}) => {
    const { isLoaded, isSignedIn, user } = useUser();

    const router = useRouter();
    const id = router.query.id;
    console.log(`Page ID: ${id}`);

    // console.log(`Passing piece_list (Next Line): `)
    // console.log(piece_list)

    // console.log(`Loaded: ${isLoaded} | Signed in: ${isSignedIn} ${(user != null) ?  `| User (next line):` : ``}`)
    // if (user != null) console.log(user)

    console.log(`Loaded: ${isLoaded} | Signed in: ${isSignedIn} | User (next line):`)
    console.log((user != null) ? user : `No User`)

    if (!router.isReady) { return null }
    else if (isLoaded == false) { 
        return ( 
            <DetailsPage id={id} piece_list={piece_list} router={router} isLoaded={false} isSignedIn={false} user={null}/> 
        )
    }
    else if ((isSignedIn !== undefined && isSignedIn == true) && (user == undefined || user == null)) { 
        return ( 
            <DetailsPage id={id} piece_list={piece_list} router={router} isLoaded={isLoaded} isSignedIn={false} user={null}/> 
        )
    }
    else {
        return ( 
            <DetailsPage id={id} piece_list={piece_list} router={router} isLoaded={isLoaded} isSignedIn={isSignedIn} user={user}/> 
        )
    }

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