import { useRouter } from 'next/router'

import { fetch_pieces } from '../../lib/api_calls';

import CheckoutPage from '../../src/components/pages/checkout/CheckoutPage';

const baseURL = "https://jwsfineartpieces.s3.us-west-1.amazonaws.com";

const Checkout = ({ pieces }) => {
    const router = useRouter();
    const id = router.query.id;
    console.log(`Page ID: ${id}`);

    if (!router.isReady) return null
    return ( <CheckoutPage id={id} pieces={pieces} router={router}/> )
}

export default Checkout

export const getServerSideProps = async (context) => {
    console.log(`-------------- Fetching Initial Server List --------------`)
    const pieces = await fetch_pieces();
  
    return {
      props: {pieces: pieces}, // will be passed to the page component as props
    }
}