import React from 'react';
import { useRouter } from 'next/router'

import { useSession } from '../lib/next-auth-react-query';
import { prisma } from '../lib/prisma'

import PageLayout from '../src/components/layout/PageLayout'
import OrderTree from '../src/components/OrderTree'

import styles from '../styles/pages/Orders.module.scss'

// using client side session retrieval
const Orders = ({ verified_list }) => {
  const router = useRouter()
  const refresh_data = () => {
    router.replace(router.asPath)
  }

  const [session, loading] = useSession({
    required: true,
    queryConfig: {
      staleTime: 60 * 1000 * 60 * 3, // 3 hours
      refetchInterval: 60 * 1000 * 5, // 5 minutes
    },
  });

  var page_jsx = null;
  if (loading) {
    page_jsx = <h1>Loading...</h1>;
  } else {
    if (!session) {
      // Session Does Not exist
      page_jsx =  (
        <h1>Not signed in</h1>
      );
    } else {
      // Session Exists
      console.log("Session (Next Line):");
      console.log(session)

      console.log(`User Role: ${session.token?.role}`)

      if ( !session.token?.role && session.token?.role != 'ADMIN' ) {
        // User Role Token does not exist or User role is not ADMIN
        page_jsx =  (
          <h1>Not signed in</h1>
        );
      } else {
        // User Role is Admin
        console.log("LOAD PIECE MANAGEMENT PAGE")

        page_jsx =  (
          <div className={styles.manage_main_container}>
            <div className={styles.pieces_tree_container}>
              <OrderTree verified_list={verified_list}
                         refresh_data={refresh_data}
              />
            </div>
          </div>
        );
      }
    }
  }

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

export const getStaticProps = async (context) => {
  console.log("Getting Static Props")
  const verified_list = await fetchVerfiedPayments()

  //console.log(context)
  return { 
      props: {
          "verified_list": verified_list
      },
      revalidate: 60
  }
}

export default Orders;
