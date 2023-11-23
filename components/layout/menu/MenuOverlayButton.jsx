import React from 'react';
import styles from '@/styles/layout/MenuOverlay.module.scss';
import { useClerk } from '@clerk/clerk-react';
import { useRouter } from 'next/navigation';

function MenuOverlayButton({ menu_name, id, url_endpoint }) {
    const router = useRouter();
    const clerk = useClerk();

    if (menu_name === 'Sign Out') {
        return (
            <div className={styles.menu_overlay_item} id={id} onClick={() => clerk.signOut()}>
                <b className={styles.menu_overlay_item_title}>{menu_name}</b>
            </div>
        );
    }

    return (
        <div
            className={styles.menu_overlay_item}
            id={id}
            onClick={(e) => {
                e.preventDefault();
                console.log('Pushing to: ' + url_endpoint);
                router.push(url_endpoint);
            }}
        >
            <b className={styles.menu_overlay_item_title}>{menu_name}</b>
        </div>
    );
}

export default MenuOverlayButton;
