import React from 'react';
import { useRouter } from 'next/router'
import { UserButton, useUser, RedirectToSignIn } from "@clerk/clerk-react";

import { prisma } from '../lib/prisma'

import PageLayout from '../src/components/layout/PageLayout'
import UserTree from '../src/components/pages/admin/UserTree'

import styles from '../styles/pages/Admin.module.scss'

// using client side session retrieval
const Admin = ({ user_tree_data }) => {
  const router = useRouter()
  const refresh_data = () => {
    console.log("Refreshing Data...")
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
  const role = user.publicMetadata.role;
  console.log(`USER ROLE: ${role}`)
  if (user.publicMetadata.role !== "ADMIN") {
    router.push('/')
  }

  const page_jsx =  (
    <div className={styles.admin_main_container}>
      <div className={styles.user_tree_container}>
        <UserTree user_tree_data={user_tree_data}
                  refresh_data={refresh_data}
        />
      </div>
    </div>
  );

  return (
    <PageLayout page_title={"Admin"}>
      <div className={styles.main_container}>
        <div className={styles.main_body}>
          <h2 className={styles.module_title}>User Management:</h2>
          {page_jsx}
        </div>
      </div>
    </PageLayout>
  )
};

export async function getServerSideProps() {
  const users = await prisma.user.findMany();
  console.log(`Retrieved users (Next Line):`)
  console.log(users);

  const piece = await prisma.piece.findFirst({
    orderBy: {
        o_id: 'desc',
    },
  })

  const user_tree_data = JSON.parse(JSON.stringify(users));

  return { props: { "user_tree_data": user_tree_data, "most_recent_id": piece['id'] } }

}

export default Admin;
