
import PageLayout from '../src/components/layout/PageLayout'

import styles from '../styles/Menu.module.scss'
import MenuButton from '../src/components/MenuButton';

import { menu_list } from "../lib/menu_list";

function generate_menu(menu_list) {
    var menu_items = [];
    for (var i=0; i < menu_list.length; i++) {

        let class_name = menu_list[i][0];
        let menu_item_string = menu_list[i][1];
        let url_endpoint = menu_list[i][3];

        console.log(`Creating Menu Item for: ${menu_item_string}`);

        const menu_item = <MenuButton 
                            id = {i}
                            menu_name = {menu_item_string}
                            url_endpoint = {url_endpoint}
                          />;

        menu_items.push(menu_item);
    }

    return menu_items
}

const Menu = ({}) => {
    console.log("Menu List (Next Line):");
    console.log(menu_list);
        
    var menu_items = generate_menu(menu_list);

    return (
        <PageLayout>
        <div className={styles.menu_container}>
            <div className={styles.menu_items_container}>
                {menu_items}
            </div>

            <div className={styles.menu_details_container}>
                <div className={styles.menu_details_text_container}>
                    <b className={`${styles.menu_details_text} ${styles.title}`}>Jill Weeks Smith</b>
                </div>
                <div className={styles.menu_details_text_container}>
                    <a className={`${styles.menu_details_link} ${styles.link}`} href="mailto:jwsfineart@gmail.com">jwsfineart@gmail.com</a>
                </div>
            </div>
        </div>
        </PageLayout>
    )
}

export default Menu;
