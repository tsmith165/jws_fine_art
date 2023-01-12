import { useSession } from "next-auth/react"

import styles from "../../../styles/layout/MenuOverlay.module.scss"

import MenuOverlayButton from './MenuOverlayButton';

import { admin_menu_list, menu_list } from "../../../lib/menu_list"

function generate_menu(menu_list, set_menu_open) {
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
                            set_menu_open = {set_menu_open}
                          />;

        menu_items.push(menu_item);
    }

    return menu_items
}

const MenuOverlay = ({ set_menu_open }) => {
    const { data: session, status } = useSession()

    var using_menu = [];

    if (status === "loading") {
        console.log("Loading - Generating DEFAULT menu...")
        using_menu = menu_list;

    } else if (status === "authenticated") {
        console.log(`User Role: ${session.token?.role}`)
  
        if ( session.token?.role && session.token?.role == 'ADMIN' ) {
            console.log("ADMIN Role Found - Generating ADMIN menu...")
            using_menu = admin_menu_list;
        } else {
            console.log("Non-ADMIN Role Found - Generating DEFAULT menu...")
            using_menu = menu_list;
        }
    } else {
        console.log("No Session - Generating DEFAULT menu...")
        using_menu = menu_list;
    }

    console.log("Menu List (Next Line):");
    console.log(using_menu);
        
    var menu_items = generate_menu(using_menu, set_menu_open);

    return (
        <div className={styles.menu_overlay_items_container}>
            {menu_items}
        </div>
    )
}

export default MenuOverlay;
