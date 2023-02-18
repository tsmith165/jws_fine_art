import styles from '../../../../styles/layout/MenuOverlay.module.scss'

import useClerk from "@clerk/clerk-react";
import { useRouter } from 'next/router'

const MenuOverlayButton = ({id, menu_name, url_endpoint, app_state, app_set_state}) => {
    const router = useRouter();
    router.prefetch(url_endpoint);

    if (menu_name == 'Sign Out') {
        const { signOut } = useClerk();
        return (
            <div className={styles.menu_overlay_item} id={id} onClick={() => signOut()}>
                <b className={styles.menu_overlay_item_title}>{menu_name}</b>
            </div>
        )
    }
    return (
        <div className={styles.menu_overlay_item} id={id} onClick={ (e) => {e.preventDefault(); app_set_state({...app_state, menu_open: false}); router.push(url_endpoint)} }>
            <b className={styles.menu_overlay_item_title}>{menu_name}</b>
        </div>
    )
}

export default MenuOverlayButton