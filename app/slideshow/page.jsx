export const metadata = {
  title: 'JWS Fine Art - Gallery Slideshow',
  description: 'Gallery slideshow for JWS Fine Art',
  icons: {
      icon: '/JWS_ICON.png',
  },
}

import { prisma } from '@/lib/prisma';

import PageLayout from '@/components/layout/PageLayout';
import Slideshow from '@/app/slideshow/Slideshow';

export default async function Page(props) {
  const {piece_list, most_recent_id} = await get_piece_list()

  return (
    <PageLayout {...props}>
      <Slideshow piece_list={piece_list} most_recent_id={most_recent_id}/>
    </PageLayout>
  )
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