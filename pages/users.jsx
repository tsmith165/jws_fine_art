import React from 'react';
import { withRouter } from 'next/router';

import { prisma } from '../lib/prisma';

import PageLayout from '../src/components/layout/PageLayout';
import UserTree from '../src/components/pages/users/UserTree';

import styles from '../styles/pages/Users.module.scss';

class Users extends React.Component {
    constructor(props) {
        super(props);

        this.page_title = "Gallery JWS Fine Art"
    }

    async componentDidMount() { }

    render() {
        if (!this.props.isLoaded) { return(<></>) }
        if (!this.props.isSignedIn) { this.props.router.push('/') }
        if (this.props.user == null) { this.props.router.push('/') }
        
        const role = (this.props.user.publicMetadata.role !== undefined) ? this.props.user.publicMetadata.role : null;
        console.log(`USER ROLE: ${role}`)
        
        if (role !== "ADMIN") { this.props.router.push('/') }
        
        if (!this.props.router.isReady) { return(<></>) }

        return (
            <PageLayout page_title={"Admin"}>
                <div className={styles.main_container}>
                    <div className={styles.main_body}>
                        <h2 className={styles.module_title}>User Management:</h2>
                        <div className={styles.admin_main_container}>
                            <div className={styles.user_tree_container}>
                                <UserTree user_tree_data={this.props.user_tree_data} refresh_data={this.props.refresh_data}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </PageLayout>
        )
    }
}

// using client side session retrieval
const Users = ({ user_tree_data, isLoaded, isSignedIn, user }) => {
  const router = useRouter()
  const refresh_data = () => {
    console.log("Refreshing Data...")
    router.replace(router.asPath)
  }

  if (!isLoaded) {
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
          <div className={styles.admin_main_container}>
            <div className={styles.user_tree_container}>
              <UserTree user_tree_data={user_tree_data}
                        refresh_data={refresh_data}
              />
            </div>
          </div>
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

export default withRouter(Users);
