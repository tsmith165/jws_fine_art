import PageLayout from '../src/components/layout/PageLayout'
import BiographyPage from '../src/components/pages/biography/BiographyPage'

import { prisma } from '../lib/prisma'

export default function Biography({}) {
  return (
    <PageLayout page_title={"Biography"}>
      <BiographyPage/>
    </PageLayout>
  )
}

export const getServerSideProps = async (context) => {
  console.log("Getting Server Side Props")
  const piece = await prisma.piece.findFirst({
    orderBy: {
        o_id: 'desc',
    },
  })

  return { 
    props: {
      "most_recent_id": piece['id']
    }
  }
}