import styles from '../../styles/Menu.module.scss'
import Link from 'next/link'

const MenuButton = ({id, menu_name, url_endpoint}) => {
    return (
        <Link href={url_endpoint} passHref={true}> 
            <div className={styles.menu_item} id={id}>
                <b className={styles.menu_item_title}>{menu_name}</b>
            </div>
        </Link>
        )
}

export default MenuButton