export const metadata = {
  title: 'JWS Fine Art - Gallery',
  description: 'Gallery page for JWS Fine Art',
  icons: {
      icon: '/JWS_ICON.png',
  },
}

import PageLayout from '@/components/layout/PageLayout';
import Gallery from '@/components/pages/gallery/Gallery'

import { prisma } from '@/lib/prisma'

export default async function Page() {
  const {piece_list, most_recent_id} = await get_piece_list()

  // console.log(`Returning most recent ID: ${most_recent_id} | piece_list:`, piece_list)

  return (
    <PageLayout >
      <Gallery piece_list={piece_list} most_recent_id={most_recent_id}/>
    </PageLayout>
  );
}

async function fetchPieces() {
  console.log(`Fetching pieces with prisma`)
  const piece_list = await prisma.piece.findMany({
    orderBy: {
      o_id: 'desc',
    }
  })
  return piece_list
}

async function get_piece_list() {
  console.log("Fetching piece list...")
  const piece_list = await fetchPieces()

  //console.log(`Found piece_list:`, piece_list)

  return {
      "piece_list": piece_list,
      "most_recent_id": piece_list[0]['id']
    }
}