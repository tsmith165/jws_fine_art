import React from 'react';
import { useRouter } from 'next/router';

import { prisma } from '../lib/prisma';

import PageLayout from '../src/components/layout/PageLayout';
import PieceTree from '../src/components/pages/manage/PieceTree';

import styles from '../styles/pages/Admin.module.scss';

// using client side session retrieval
const Manage = ({ piece_list, isLoaded, isSignedIn, user }) => {
  const router = useRouter()
  const refresh_data = () => {
    router.replace(router.asPath)
  }

  if  (!isLoaded) {
    return(<></>)
  }
  if (!isSignedIn) {
    router.push('/')
  }
  if (user == null) {
    router.push('/')
  }
  const role = user.publicMetadata.role;
  console.log(`USER ROLE: ${role}`)
  if (user.publicMetadata.role !== "ADMIN") {
    router.push('/')
  }
  const page_jsx =  (
    <div className={styles.manage_main_container}>
      <div className={styles.pieces_tree_container}>
        <PieceTree piece_tree_data={piece_list}
                    refresh_data={refresh_data}
        />
      </div>
    </div>
  );

  return (
    <PageLayout page_title={"Management"}>
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

export default Manage;
