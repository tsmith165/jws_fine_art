import React from 'react';
import { useRouter } from 'next/router'

import { useSession } from '../lib/next-auth-react-query';
import { prisma } from '../lib/prisma'

import PageLayout from '../src/components/layout/PageLayout'
import PieceTree from '../src/components/PieceTree'

import styles from '../styles/pages/Admin.module.scss'

// using client side session retrieval
const Manage = ({ piece_list }) => {
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
              <PieceTree piece_tree_data={piece_list}
                         refresh_data={refresh_data}
              />
            </div>
          </div>
        );
      }
    }
  }

  return (
    <PageLayout>
      <div className={styles.main_container}>
        <div className={styles.main_body}>
          <h2 className={styles.module_title}>Piece Management:</h2>
          {page_jsx}
        </div>
      </div>
    </PageLayout>
  )
};

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

export default Manage;
