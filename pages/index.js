import { prisma } from '../lib/prisma'

import PageLayout from '../src/components/layout/PageLayout'
import Gallery from '../src/components/Gallery';

import styles from '../styles/Home.module.scss'
import useWindowSize from '../lib/useWindowSize'

export default function Home({piece_list}) {
  console.log("CURRENT PIECE LIST (NEXT LINE):")
  console.log(piece_list);

  var window_size = useWindowSize()

  return (
    <PageLayout>
      <div className={styles.gallery_container}>
        <Gallery piece_list={piece_list} window_size={window_size}/>
      </div>
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

export const getStaticProps = async (context) => {
  console.log("Getting Static Props")
  const piece_list = await fetchPieces()

  //console.log(context)
  return { 
      props: {
          "piece_list": piece_list
      },
      revalidate: 60
  }
}
