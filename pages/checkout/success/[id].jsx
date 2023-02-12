import { useRouter } from 'next/router'

import { prisma } from '../../../lib/prisma'

import SuccessPage from '../../../src/components/pages/success/SuccessPage';

const baseURL = "https://jwsfineartpieces.s3.us-west-1.amazonaws.com";

const Success = ({ piece_list }) => {
    const router = useRouter();
    const id = router.query.id;
    console.log(`Page ID: ${id}`);

    if (!router.isReady) return null
    return ( <SuccessPage id={id} piece_list={piece_list} router={router}/> )
}

export default Success

export const getServerSideProps = async (context) => {
    console.log(`-------------- Fetching Initial Server List --------------`)
    var piece_list = await prisma.piece.findMany()
    piece_list.sort((a, b) => a['o_id'] - b['o_id']);
  
    return {
      props: {piece_list: piece_list, most_recent_id: piece_list[piece_list.length - 1]['id']}, // will be passed to the page component as props
    }
}