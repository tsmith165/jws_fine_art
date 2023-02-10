import { useRouter } from 'next/router'

import CheckoutPage from '../../src/components/pages/checkout/CheckoutPage';

const baseURL = "https://jwsfineartpieces.s3.us-west-1.amazonaws.com";

const Checkout = ({}) => {
    const router = useRouter();
    const id = router.query.id;
    console.log(`Page ID: ${id}`);

    if (!router.isReady) return null
    return ( <CheckoutPage id={id} router={router}/> )
}

export default Checkout