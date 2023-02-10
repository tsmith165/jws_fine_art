import { useRouter } from 'next/router'

import DetailsPage from '../../src/components/pages/details/DetailsPage';

const baseURL = "https://jwsfineartpieces.s3.us-west-1.amazonaws.com";

const Details = ({}) => {
    const router = useRouter();
    const id = router.query.id;
    console.log(`Page ID: ${id}`);

    if (!router.isReady) return null
    return ( <DetailsPage id={id} router={router}/> )
}

export default Details