'use client'

import { useState } from 'react';
import { useUser } from "@clerk/nextjs";
import styles from '@/styles/pages/Users.module.scss';

import PieceTree from './PieceTree';

import { fetch_pieces } from '@/lib/api_calls';

const Manage = (props) => {
    const { isLoaded, isSignedIn, user } = useUser();

    const [pieceList, setPieceList] = useState(props.piece_list);

    const refreshPieceList = async () => {
        const updatedList = await fetch_pieces();
        setPieceList(updatedList);
    };

    console.log(`Clerk User Loaded: ${isLoaded} | Signed In: ${isSignedIn} | User Role: ${user && user.publicMetadata?.role?.toLowerCase() || 'none'}`);
    if (!isLoaded) {
        return <div>Loading...</div>
    } else if (!isSignedIn) {
        return <div>Not signed in</div>
    } else if (!user || user.publicMetadata?.role?.toLowerCase() != 'admin') {
        console.log(`Current user is not admin - Role: ${user.publicMetadata?.role?.toLowerCase() || 'none'}`)
        return <div>User not admin</div>
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
