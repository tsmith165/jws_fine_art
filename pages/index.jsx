import { prisma } from '../lib/prisma'

import PageLayout from '../src/components/layout/PageLayout'
import GalleryPage from '../src/components/pages/gallery/GalleryPage';

import styles from '../styles/components/Gallery.module.scss'
import useWindowSize from '../lib/useWindowSize'

export default function Home({piece_list}) {
  //console.log("CURRENT PIECE LIST (NEXT LINE):")
  //console.log(piece_list);

  const window_size = useWindowSize()
  // console.log(`Width: ${window_size.width} | Height: ${window_size.height}`)

  return (
    <PageLayout page_title={"JWS Fine Art"}>
      <GalleryPage piece_list={piece_list} window_width={window_size.width} window_height={window_size.height}/>
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
