'use client'

import { useState } from 'react';
import { useUser } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import styles from '@/styles/pages/Users.module.scss';

import PieceTree from './PieceTree';

import { fetch_pieces } from '@/lib/api_calls';

const Manage = (props) => {
    const router = useRouter();

    const { isLoaded, isSignedIn, user } = useUser();

    const [pieceList, setPieceList] = useState(props.piece_list);

    const refreshPieceList = async () => {
        const updatedList = await fetch_pieces();
        const reversedList = updatedList.reverse(); // Reversing the order of the list to match initial load order
        console.log("Updated Piece List (Reversed Order): ", reversedList);
        setPieceList(reversedList);
    };

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
                <h2 className={styles.module_title}>Piece Management:</h2>
                <div className={styles.manage_main_container}>
                    <div className={styles.pieces_tree_container}>
                        <PieceTree piece_tree_data={pieceList} refresh_data={refreshPieceList} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Manage;
