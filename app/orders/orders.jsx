'use client'

import { useUser } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';

import OrderTree from './OrderTree';

import styles from '@/styles/pages/Orders.module.scss'

const Orders = (props) => {
    const router = useRouter();
    const { isLoaded, isSignedIn, user } = useUser();

    console.log(`Clerk User Loaded: ${isLoaded} | Signed In: ${isSignedIn} | User Role: ${user && user.publicMetadata?.role?.toLowerCase() || 'none'}`);
    if (!isLoaded) {
        return <div>Loading...</div>
    }
    if (!isSignedIn) {
        console.log('User is not signed in.  Redirecting to signin page...')
        return router.push('/signin')
    } 
    if (!user || user.publicMetadata?.role?.toLowerCase() != 'admin') {
        console.log(`Current user is not admin - Role: ${user.publicMetadata?.role?.toLowerCase() || 'none'}`)
        return router.push('/signin')
    }
    return (
        <div className={styles.main_container}>
            <div className={styles.main_body}>
                <h2 className={styles.module_title}>Order Management:</h2>
                <div className={styles.manage_main_container}>
                    <div className={styles.pieces_tree_container}>
                        <OrderTree verified_list={props.verified_list} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Orders;
