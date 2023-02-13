import styles from '../../../styles/layout/MenuOverlay.module.scss'
import Link from 'next/link'
import { useClerk } from "@clerk/clerk-react";

const MenuOverlayButton = ({id, menu_name, url_endpoint, set_menu_open}) => {
    if (menu_name == 'Sign Out') {
        const { signOut } = useClerk();
        return (
            <div className={styles.menu_overlay_item} id={id} onClick={() => signOut()}>
                <b className={styles.menu_overlay_item_title}>{menu_name}</b>
            </div>
        )
    }
    return (
        <Link href={url_endpoint} onClick={set_menu_open(false)}> 
            <div className={styles.menu_overlay_item} id={id}>
                <b className={styles.menu_overlay_item_title}>{menu_name}</b>
            </div>
        </Link>
    )
}

export default MenuOverlayButton