import styles from '../../../styles/layout/MenuOverlay.module.scss'
import Link from 'next/link'
import { useClerk } from "@clerk/clerk-react";
import {useRouter} from 'next/router'

const MenuOverlayButton = ({id, menu_name, url_endpoint, set_menu_open}) => {
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
        <div className={styles.menu_overlay_item} id={id} onClick={ (e) => {e.preventDefault(); set_menu_open(false); router.push(url_endpoint)} }>
            <b className={styles.menu_overlay_item_title}>{menu_name}</b>
        </div>
    )
}

export default MenuOverlayButton