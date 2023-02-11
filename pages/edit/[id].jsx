import { useRouter } from 'next/router'
import { UserButton, useUser, RedirectToSignIn } from "@clerk/clerk-react";

import { prisma } from '../../lib/prisma'

import EditPage from '../../src/components/pages/edit/EditPage';

const baseURL = "https://jwsfineartpieces.s3.us-west-1.amazonaws.com";

const Edit = ({ pieces }) => {
    const { isLoaded, isSignedIn, user } = useUser();

    console.log(`Passing pieces (Next Line): `)
    console.log(pieces)

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

export const getServerSideProps = async (context) => {
  console.log(`-------------- Fetching Initial Server List --------------`)
  var pieces = await prisma.piece.findMany()
  pieces.sort((a, b) => a['o_id'] - b['o_id']);

  return {
    props: {pieces: pieces}, // will be passed to the page component as props
  }
}