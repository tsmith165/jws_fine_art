import { useRouter } from 'next/router'

import { prisma } from '../../lib/prisma'

import DetailsPage from '../../src/components/pages/details/DetailsPage';

const baseURL = "https://jwsfineartpieces.s3.us-west-1.amazonaws.com";

const Details = ({pieces}) => {
    const router = useRouter();
    const id = router.query.id;
    console.log(`Page ID: ${id}`);

    console.log(`Passing pieces (Next Line): `)
    console.log(pieces)

    if (!router.isReady) return null
    return ( <DetailsPage id={id} pieces={pieces} router={router}/> )
}

export default Details

export const getServerSideProps = async (context) => {
    console.log(`-------------- Fetching Initial Server List --------------`)
    var pieces = await prisma.piece.findMany()
    pieces.sort((a, b) => a['o_id'] - b['o_id']);

    return {
      props: {pieces: pieces}, // will be passed to the page component as props
    }
}