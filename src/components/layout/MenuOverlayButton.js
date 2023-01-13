import styles from '../../../styles/layout/MenuOverlay.module.scss'
import Link from 'next/link'

const MenuOverlayButton = ({id, menu_name, url_endpoint, set_menu_open}) => {
    return (
        <Link href={url_endpoint} passHref={true} prefetch={false} onClick={(e) => {e.preventDefault(); set_menu_open(false)} }> 
            <div className={styles.menu_overlay_item} id={id}>
                <b className={styles.menu_overlay_item_title}>{menu_name}</b>
            </div>
        </Link>
        )
}

export default MenuOverlayButton