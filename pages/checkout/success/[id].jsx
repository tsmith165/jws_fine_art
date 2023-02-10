import { useRouter } from 'next/router'

import SuccessPage from '../../../src/components/pages/success/SuccessPage';

const baseURL = "https://jwsfineartpieces.s3.us-west-1.amazonaws.com";

const Success = ({}) => {
    const router = useRouter();
    const id = router.query.id;
    console.log(`Page ID: ${id}`);

    if (!router.isReady) return null
    return ( <SuccessPage id={id} router={router}/> )
}

export default Success