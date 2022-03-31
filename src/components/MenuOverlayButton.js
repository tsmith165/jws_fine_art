import styles from '../../styles/MenuOverlay.module.scss'
import Link from 'next/link'

const MenuOverlayButton = ({id, menu_name, url_endpoint}) => {
    return (
        <Link href={url_endpoint} passHref={true}> 
            <div className={styles.menu_overlay_item} id={id}>
                <b className={styles.menu_overlay_item_title}>{menu_name}</b>
            </div>
        </Link>
        )
}

export default MenuOverlayButton