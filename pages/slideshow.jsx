import { prisma } from '../lib/prisma'

import PageLayout from '../src/components/layout/PageLayout'
import SlideshowComponent from '../src/components/Slideshow';

import styles from '../styles/components/Slideshow.module.scss'

export default function Slideshow({piece_list}) {
  //console.log("CURRENT PIECE LIST (NEXT LINE):")
  //console.log(piece_list);

  return (
    <PageLayout page_title={"Slideshow"}>
      <div className={styles.slideshow_container}>
        <SlideshowComponent piece_list={piece_list}/>
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

export const getServerSideProps = async (context) => {
  console.log("Getting Server Side Props")
  const piece_list = await fetchPieces()

  //console.log(context)
  return { 
      props: {
          "piece_list": piece_list
      },
      revalidate: 60
  }
}
