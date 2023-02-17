import React from 'react';
import { useRouter } from 'next/router'
import { useUser } from "@clerk/clerk-react";

import { prisma } from '../lib/prisma'

import PageLayout from '../src/components/layout/PageLayout'
import OrderTree from '../src/components/components/OrderTree'

import styles from '../styles/pages/Orders.module.scss'

// using client side session retrieval
const Orders = ({ verified_list }) => {
  const router = useRouter()
  const refresh_data = () => {
    router.replace(router.asPath)
  }

  const { isLoaded, isSignedIn, user } = useUser();

  if  (!isLoaded) {
    return(<></>)
  }
  if (!isSignedIn) {
    router.push('/')
  }
  if (user == null) {
    router.push('/')
  }
  console.log(`USER: ${user}`)
  if (!'publicMetadata' in user) {
    router.push('/')
  }
  if (user.publicMetadata.role !== "ADMIN") {
    router.push('/')
  }

  const page_jsx =  (
    <div className={styles.manage_main_container}>
      <div className={styles.pieces_tree_container}>
        <OrderTree verified_list={verified_list}
                    refresh_data={refresh_data}
        />
      </div>
    </div>
  );

  return (
    <PageLayout page_title={"Orders"}>
      <div className={styles.main_container}>
        <div className={styles.main_body}>
          <h2 className={styles.module_title}>Order Management:</h2>
          {page_jsx}
        </div>
      </div>
    </PageLayout>
  )
};

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

export const getServerSideProps = async (context) => {
  console.log("Getting Server Side Props")
  const verified_list = await fetchVerfiedPayments()

  const piece = await prisma.piece.findFirst({
    orderBy: {
        o_id: 'desc',
    },
  })

  return { 
    props: {
      "verified_list": verified_list,
      "most_recent_id": piece['id']
    }
  }
}

export default Orders;
