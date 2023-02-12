import { useRouter } from 'next/router'
import { useUser } from "@clerk/clerk-react";

import { prisma } from '../../lib/prisma'

import EditPage from '../../src/components/pages/edit/EditPage';

const baseURL = "https://jwsfineartpieces.s3.us-west-1.amazonaws.com";

const Edit = ({ piece_list }) => {
    const { isLoaded, isSignedIn, user } = useUser();

    console.log(`Passing piece_list (Next Line): `)
    console.log(piece_list)

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
    return ( <EditPage id={id} piece_list={piece_list} router={router}/> )
}

export default Edit

export const getServerSideProps = async (context) => {
  console.log(`-------------- Fetching Initial Server List --------------`)
  var piece_list = await prisma.piece.findMany()
  piece_list.sort((a, b) => a['o_id'] - b['o_id']);

  return {
    props: {piece_list: piece_list, most_recent_id: piece_list[piece_list.length - 1]['id']}, // will be passed to the page component as props
  }
}