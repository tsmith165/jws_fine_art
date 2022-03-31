import Link from 'next/link'
import styles from "../../../styles/Navbar.module.scss"

import MenuOverlayButton from '../MenuOverlayButton';

import { admin_menu_list, menu_list } from "../../../lib/menu_list"

function generate_menu(menu_list) {
    var menu_items = [];
    for (var i=0; i < menu_list.length; i++) {

        let class_name = menu_list[i][0];
        let menu_item_string = menu_list[i][1];
        let url_endpoint = menu_list[i][3];

        console.log(`Creating Menu Item for: ${menu_item_string}`);

        const menu_item = <MenuOverlayButton 
                            id = {i}
                            menu_name = {menu_item_string}
                            url_endpoint = {url_endpoint}
                          />;

        menu_items.push(menu_item);
    }

    return menu_items
}

const Menu = ({ session }) => {
    var using_menu = [];

    if (session) {
        console.log("Session (Next Line):");
        console.log(session)
  
        console.log(`User Role: ${session.token?.role}`)
  
        if ( session.token?.role && session.token?.role == 'ADMIN' ) {
            using_menu = admin_menu_list;
        } else {
            using_menu = menu_list;
        }
    } else {
        using_menu = menu_list;
    }


    console.log("Menu List (Next Line):");
    console.log(using_menu);
        
    var menu_items = generate_menu(using_menu);

    return (
        <div className={styles.menu_overlay_items_container}>
            {menu_items}
        </div>
    )
}

export default Menu;
