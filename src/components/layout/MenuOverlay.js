import styles from "../../../styles/layout/MenuOverlay.module.scss"

import MenuOverlayButton from './MenuOverlayButton';

import { UserButton, useUser, RedirectToSignIn } from "@clerk/clerk-react";

import { admin_menu_list, signed_out_menu_list, signed_in_menu_list } from "../../../lib/menu_list"
import { useEffect } from "react";

function generate_menu(menu_list, set_menu_open) {
    var menu_items = [];
    for (var i=0; i < menu_list.length; i++) {

        let class_name = menu_list[i][0];
        let menu_item_string = menu_list[i][1];
        let url_endpoint = menu_list[i][3];

        console.log(`Creating Menu Item for: ${menu_item_string}`);

        const menu_item = <MenuOverlayButton
                            key={i}
                            id = {i}
                            menu_name = {menu_item_string}
                            url_endpoint = {url_endpoint}
                            set_menu_open = {set_menu_open}
                          />;

        menu_items.push(menu_item);
    }

    return menu_items
}

function select_menu(isLoaded, isSignedIn, user) {
    if (!isLoaded) {
        console.log('User not loaded - returning signed out menu...')
        return signed_out_menu_list
    }
    if (!isSignedIn) {
        console.log('User not signed in - returning signed out menu...')
        return signed_out_menu_list
    }
    if (user == null) {
        console.log('User equals null - returning signed out menu...')
        return signed_out_menu_list
    }
    if (!'publicMetadata' in user) {
        console.log('User does not contain publicMetadata - returning signed out menu...')
        return signed_out_menu_list
    }
    if (!'role' in user.publicMetadata) {
        console.log('User does not contain role - returning signed out menu...')
        return signed_out_menu_list
    }
    if (user.publicMetadata.role === 'ADMIN') {
        console.log('User has role Admin - returning signed in admin menu...')
        return admin_menu_list
    }
    console.log('User does not have role Admin - returning signed in non-admin menu...')
    return signed_in_menu_list
}

const MenuOverlay = ({ set_menu_open }) => {

    const { isLoaded, isSignedIn, user } = useUser();
    console.log(`Generating menu list - Loaded?: ${isLoaded} | Signed In: ${isSignedIn} | User (Next Line): `)
    console.log(user)
    const using_menu = select_menu(isLoaded, isSignedIn, user);

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
