import { useRouter } from 'next/router'

import { fetch_pieces } from '../../../lib/api_calls';

import CancelPage from '../../../src/components/pages/cancel/CancelPage';

const baseURL = "https://jwsfineartpieces.s3.us-west-1.amazonaws.com";

const Cancel = ({ pieces }) => {
    const router = useRouter();
    const id = router.query.id;
    console.log(`Page ID: ${id}`);

    console.log(`Passing pieces (Next Line): `)
    console.log(pieces)

    if (!router.isReady) return null
    return ( <CancelPage id={id} pieces={pieces} router={router}/> )
}

export default Cancel

export const getServerSideProps = async (context) => {
    console.log(`-------------- Fetching Initial Server List --------------`)
    const pieces = await fetch_pieces();
  
    return {
      props: {pieces: pieces}, // will be passed to the page component as props
    }
}