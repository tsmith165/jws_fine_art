export const metadata = {
  title: 'JWS Fine Art - Homepage',
  description: 'Jill Weeks Smith Biography',
  icons: {
      icon: '/JWS_ICON.png',
  },
}

import PageLayout from '@/components/layout/PageLayout';
import Homepage from '@/app/Homepage';

import { prisma } from '@/lib/prisma';

export default async function Page(props) {
  const {most_recent_id} = await get_piece_list()

  return (
    <PageLayout {...props}>
      <Homepage most_recent_id={most_recent_id}/>
    </PageLayout>
  )
}

async function fetchFirstPiece() {
  console.log(`Fetching pieces with prisma`)
  const piece = await prisma.piece.findFirst({
    orderBy: {
        o_id: 'desc',
    },
})
  return piece
}

async function get_piece_list() {
  console.log("Fetching piece list...")
  const first_piece = await fetchFirstPiece()

  return {
      "most_recent_id": first_piece['id']
    }
}