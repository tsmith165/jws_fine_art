import { useRouter } from 'next/router'

import { prisma } from '../../lib/prisma'

import DetailsPage from '../../src/components/pages/details/DetailsPage';

const Details = ({piece_list, most_recent_id, app_state, app_set_state, isLoaded, isSignedIn, user }) => {
    const router = useRouter();
    const id = router.query.id;

    if (!router.isReady) { return null }
    if (!isLoaded) { return ( <DetailsPage id={id} piece_list={piece_list} app_state={app_state} app_set_state={app_set_state} router={router} isSignedIn={false} user={null}/> ) }

    // Not Signed In / User Does Not Exist
    if ((isSignedIn !== undefined && isSignedIn == true) && (user == undefined || user == null)) { 
        return ( <DetailsPage id={id} piece_list={piece_list} app_state={app_state} app_set_state={app_set_state} router={router} isSignedIn={false} user={null}/> )
    } 
    return ( <DetailsPage id={id} piece_list={piece_list} app_state={app_state} app_set_state={app_set_state} router={router} isSignedIn={isSignedIn} user={user}/> )
}

export default Details

export const getServerSideProps = async (context) => {
    var piece_list = await prisma.piece.findMany()
    piece_list.sort((a, b) => a['o_id'] - b['o_id']);

    // console.log(`Passing piece list (Next Line):`)
    // console.log(piece_list)

    return {
      props: {"piece_list": piece_list, "most_recent_id": piece_list[piece_list.length - 1]['id']}, // will be passed to the page component as props
    }
}