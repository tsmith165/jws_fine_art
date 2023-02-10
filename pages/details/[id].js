import { useRouter } from 'next/router'

import DetailsPage from '../../src/components/pages/details/DetailsPage';

const Details = ({}) => {
    const router = useRouter();
    const id = router.query.id;
    console.log(`Page ID: ${id}`);

    const page_jsx =  (
        <DetailsPage id={id} router={router}/>
    )

    return page_jsx
}

export default Details