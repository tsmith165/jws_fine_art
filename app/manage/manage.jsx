'use client'

import PieceTree from './PieceTree';
import styles from '@/styles/pages/Users.module.scss';

import { useUser } from "@clerk/nextjs";

import { useRouter } from 'next/navigation';

const Manage = (props) => {
    const router = useRouter();
    const { isLoaded, isSignedIn, user } = useUser();

    console.log(`Clerk User Loaded: ${isLoaded} | Signed In: ${isSignedIn} | User Role: ${user && user.publicMetadata?.role?.toLowerCase() || 'none'}`);
    if (!isLoaded) {
        return <div>Loading...</div>
    } else if (!isSignedIn) {
        return <div>Not signed in</div>
    } else if (!user || user.publicMetadata?.role?.toLowerCase() != 'admin') {
        console.log(`Current user is not admin - Role: ${user.publicMetadata?.role?.toLowerCase() || 'none'}`)
        return <div>User not admin</div>
    }

    const refresh_data = () => {
        router.replace(router.asPath);
    };

    return (
        <div className={styles.main_container}>
            <div className={styles.main_body}>
                <h2 className={styles.module_title}>Piece Management:</h2>
                <div className={styles.manage_main_container}>
                    <div className={styles.pieces_tree_container}>
                        <PieceTree
                            piece_tree_data={props.piece_list}
                            refresh_data={refresh_data}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Manage;
