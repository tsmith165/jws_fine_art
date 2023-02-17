import styles from "../../../../styles/layout/MenuOverlay.module.scss"

import MenuOverlayButton from './MenuOverlayButton';

const signed_out_menu_list = [
    ["gallery", "Gallery", false, "/"],
    ["details", "Piece Details", false, "/details/"],
    ["slideshow", "Slideshow", false, "/slideshow"],
    ["biography", "Biography", false, "/biography"],
    ["contact", "Contact", false, "/contact"],
    ["sign_in", "Sign In", false, "/signin"]
]

const signed_in_menu_list = [
    ["gallery", "Gallery", false, "/"],
    ["details", "Piece Details", false, "/details/"],
    ["slideshow", "Slideshow", false, "/slideshow"],
    ["biography", "Biography", false, "/biography"],
    ["contact", "Contact", false, "/contact"],
    ["sign_out", "Sign Out", false, "/signout"]
]

const admin_menu_list = [
    ["gallery", "Gallery", false, "/"],
    ["details", "Details", false, "/details/"],
    ["slideshow", "Slideshow", false, "/slideshow"],
    ["biography", "Biography", false, "/biography"],
    ["contact", "Contact", false, "/contact"],
    ["admin", "Admin", false, "/admin"],
    ["edit_details", "Edit Details", true, "/edit/"],
    ["management", "Management", true, "/manage"],
    ["orders", "Orders", true, "/orders"],
    ["sign_out", "Sign Out", false, "/signout"]
]

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

const MenuOverlay = ({ set_menu_open, most_recent_page_id, app_state, app_set_state, isLoaded, isSignedIn, user }) => {
    console.log(`Generating menu list - Loaded?: ${isLoaded} | Signed In: ${isSignedIn} | User (Next Line): `)
    console.log(user)
    const using_menu = select_menu(isLoaded, isSignedIn, user);

    console.log(`Most recent page ID: ${most_recent_page_id}`)
    const url_path = (app_state.url_path !== undefined) ? app_state.url_path : 'None'
    //console.log(`App State URL Path: ${url_path}`)

    var url_path_id = url_path
    if (url_path.includes('/')) {
        var url_path_split = url_path.split('/')
        console.log(url_path_id)
        url_path_id = url_path_split[url_path_split.length - 1]
    }
    // console.log(`URL PATH ID AFTER SPLIT: ${url_path_id}`)

    // Turning off menu "Edit Piece" button going to current page id as it was causing issues
    url_path_id = null

    for (var i = 0; i < using_menu.length; i++) {
        let menu_item = using_menu[i];
        let menu_class = menu_item[0];
        let menu_name = menu_item[1];
        let is_admin = menu_item[2];
        let menu_slug = menu_item[3];

        const id_pages = ['details', 'edit_details']
        if ((menu_class == 'details' || menu_class == 'edit_details') && (!menu_slug.includes(most_recent_page_id)) && (!menu_slug.includes(url_path_id))) {
            if (url_path_id != null) {
                if (using_menu[i][3].includes(`${url_path_id}`) == false) {
                    using_menu[i][3] += url_path_id
                } else {
                    using_menu[i][3] += most_recent_page_id
                }
            } else {
                using_menu[i][3] += most_recent_page_id
            }
        }
    }

    console.log("Menu List (Next Line):");
    console.log(using_menu);
        
    var menu_items = generate_menu(using_menu, set_menu_open, app_state);

    return (
        <div className={styles.menu_overlay_items_container}>
            {menu_items}
        </div>
    )
}

export default MenuOverlay;
