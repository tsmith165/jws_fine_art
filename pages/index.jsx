import { prisma } from '../lib/prisma'

import PageLayout from '../src/components/layout/PageLayout'
import Gallery from '../src/components/pages/gallery/Gallery';

export default function Home({piece_list, app_state, app_set_state}) {
  //console.log("CURRENT PIECE LIST (NEXT LINE):")
  //console.log(piece_list);

  return (
    <PageLayout page_title={"JWS Fine Art"}>
      <Gallery piece_list={piece_list} app_state={app_state} app_set_state={app_set_state}/>
    </PageLayout>
  )
}

async function fetchPieces() {
  console.log(`Fetching pieces with prisma`)
  const piece_list = await prisma.piece.findMany({
      orderBy: {
          o_id: 'desc',
      },
  })

  return piece_list
}

export const getServerSideProps = async (context) => {
  console.log("Getting Server Side Props")
  const piece_list = await fetchPieces()

  return { 
    props: {
      "piece_list": piece_list,
      "most_recent_id": piece_list[0]['id']
    }
  }
}
