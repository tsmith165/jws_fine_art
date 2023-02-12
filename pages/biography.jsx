import PageLayout from '../src/components/layout/PageLayout'
import BiographyLayout from '../src/components/layout/BiographyLayout';

import { prisma } from '../lib/prisma'

export default function Biography({}) {
  return (
    <PageLayout page_title={"Biography"}>
      <BiographyLayout/>
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