import { useRouter } from 'next/router'

import CancelPage from '../../../src/components/pages/cancel/CancelPage';

const baseURL = "https://jwsfineartpieces.s3.us-west-1.amazonaws.com";

const Cancel = ({}) => {
    const router = useRouter();
    const id = router.query.id;
    console.log(`Page ID: ${id}`);

    if (!router.isReady) return null
    return ( <CancelPage id={id} router={router}/> )
}

export default Cancel