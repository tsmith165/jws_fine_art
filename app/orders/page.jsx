export const metadata = {
  title: 'JWS Fine Art - Order Management',
  description: 'Order management for JWS Fine Art',
  icons: {
      icon: '/JWS_ICON.png',
  },
}

import logger from '@/lib/logger';
import PageLayout from '@/components/layout/PageLayout';
import Orders from '@/app/orders/orders';
import { prisma } from '@/lib/prisma';

export default async function Page(props) {
  const {verified_list, most_recent_id} = await get_piece_list()

  return (
    <PageLayout {...props}>
      <Orders verified_list={verified_list} most_recent_id={most_recent_id}/>
    </PageLayout>
  )
}

async function fetchVerfiedPayments() {
  console.log(`Fetching pieces with prisma`)
  var verified_list = await prisma.verified.findMany()

  console.log("Verified Payments List (Next Line):")
  console.log(verified_list)

  for (var i = 0; i < verified_list.length; i++) {
      const date_string = new Date(verified_list[i]['date']).toUTCString();
      console.log(`Current Date: ${date_string}`)
      verified_list[i]['date'] = date_string
  }

  console.log("Verified Payments List (Next Line):")
  console.log(verified_list)

  return verified_list
}

async function get_piece_list() {
  console.log("Fetching piece list...")
  const verified_list = await fetchVerfiedPayments()
  
  const piece = await prisma.piece.findFirst({
    orderBy: {
        o_id: 'desc',
    },
  })

  return {
    "verified_list": verified_list,
    "most_recent_id": piece['id']
  }
}