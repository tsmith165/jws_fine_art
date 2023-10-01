export const metadata = {
  title: 'JWS Fine Art - Contact',
  description: 'Jill Weeks Smith Contact',
  icons: {
      icon: '/JWS_ICON.png',
  },
}

import PageLayout from '../../components/layout/PageLayout';
import ContactPage from './contact';

export default async function Page(props) {
  return (
    <PageLayout {...props}>
      <ContactPage/>
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