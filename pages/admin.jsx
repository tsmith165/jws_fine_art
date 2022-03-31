import React from 'react';
import { useRouter } from 'next/router'

import { useSession } from '../lib/next-auth-react-query';
import { prisma } from '../lib/prisma'

import PageLayout from '../src/components/layout/PageLayout'
import UserTree from '../src/components/UserTree'

import styles from '../styles/Admin.module.scss'

// using client side session retrieval
const Admin = ({ user_tree_data }) => {
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
    if (session) {
      console.log("Session (Next Line):");
      console.log(session)

      console.log(`User Role: ${session.token?.role}`)

      if ( session.token?.role && session.token?.role == 'ADMIN' ) {
        console.log("LOAD ADMIN PAGE")

        page_jsx =  (
          <div className={styles.admin_main_container}>
            <div className={styles.user_tree_container}>
              <UserTree user_tree_data={user_tree_data}
                        refresh_data={refresh_data}
              />
            </div>
          </div>
        );
      } else {
        page_jsx =  (
          <h1>User does not have required role.</h1>
        );
      }
    } else {
      page_jsx =  (
        <h1>Not signed in</h1>
      );
    }
  }

  return (
    <PageLayout>
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

  const user_tree_data = JSON.parse(JSON.stringify(users));

  return { props: { user_tree_data } }

}

export default Admin;
