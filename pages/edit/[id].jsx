import { useRouter } from 'next/router'
import { useUser } from "@clerk/clerk-react";

import { prisma } from '../../lib/prisma'

import EditPage from '../../src/components/pages/edit/EditPage';

const Edit = ({ piece_list }) => {
  const router = useRouter();
  const id = router.query.id;

  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) { return(<></>) }
  if (!isSignedIn) { router.push('/') }
  if (user == null) { router.push('/') }

  const role = (user.publicMetadata.role !== undefined) ? user.publicMetadata.role : null;
  console.log(`USER ROLE: ${role}`)

  if (role !== "ADMIN") {
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