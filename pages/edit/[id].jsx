import { useRouter } from 'next/router'
import { UserButton, useUser, RedirectToSignIn } from "@clerk/clerk-react";

import EditPage from '../../src/components/pages/edit/EditPage';

const baseURL = "https://jwsfineartpieces.s3.us-west-1.amazonaws.com";

const Edit = ({}) => {
    const { isLoaded, isSignedIn, user } = useUser();

    if  (!isLoaded) {
      return(<></>)
    }
    if (!isSignedIn) {
      router.push('/')
    }
    if (user == null) {
      router.push('/')
    }
    const role = user.publicMetadata.role;
    console.log(`USER ROLE: ${role}`)
    if (user.publicMetadata.role !== "ADMIN") {
      router.push('/')
    }

    const router = useRouter();
    const id = router.query.id;
    console.log(`Page ID: ${id}`);

    const page_jsx =  (
        <EditPage id={id} router={router}/>
    )

    return page_jsx
}

export default Edit