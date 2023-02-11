import { useRouter } from 'next/router'
import { UserButton, useUser, RedirectToSignIn } from "@clerk/clerk-react";

import { fetch_pieces } from '../../lib/api_calls';

import EditPage from '../../src/components/pages/edit/EditPage';

const baseURL = "https://jwsfineartpieces.s3.us-west-1.amazonaws.com";

const Edit = ({ pieces }) => {
    const { isLoaded, isSignedIn, user } = useUser();

    const router = useRouter();
    const id = router.query.id;
    console.log(`Page ID: ${id}`);

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
    
    if (!router.isReady) return null
    return ( <EditPage id={id} pieces={pieces} router={router}/> )
}

export default Edit

export async function getServerSideProps(context) {
  console.log(`-------------- Fetching Initial Server List --------------`)
  const pieces = await fetch_pieces();

  return {
    props: {pieces: pieces}, // will be passed to the page component as props
  }
}