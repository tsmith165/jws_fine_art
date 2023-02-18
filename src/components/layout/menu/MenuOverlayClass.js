import React from 'react';

import MenuOverlayButton from './MenuOverlayButton';

import styles from "../../../../styles/layout/MenuOverlay.module.scss"
import 'react-tooltip/dist/react-tooltip.css'

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
];

class MenuOverlay extends React.Component {
    constructor(props) {
        super(props);

        const using_menu = this.select_menu(this.props.isLoaded, this.props.isSignedIn, this.props.user);
    
        for (var i = 0; i < using_menu.length; i++) {
            let menu_item = using_menu[i];
            let menu_class = menu_item[0];
            let menu_name = menu_item[1];
            let is_admin = menu_item[2];
            let menu_slug = menu_item[3];
    
            const id_pages = ['details', 'edit_details']
            if ((menu_class == 'details' || menu_class == 'edit_details') && (!menu_slug.includes(this.props.most_recent_page_id))) {
                using_menu[i][3] += this.props.most_recent_page_id
            }
        }
    
        console.log("Menu List (Next Line):");
        console.log(using_menu);
            
        var menu_items = this.generate_menu(using_menu);

        this.state = {
            menu_items: menu_items
        }

        this.generate_menu = this.generate_menu.bind(this);
        this.select_menu = this.select_menu.bind(this);
    }

    async componentDidMount() {

    }

    generate_menu(menu_list) {
        var menu_items = [];
        for (var i=0; i < menu_list.length; i++) {
    
            let class_name = menu_list[i][0];
            let menu_item_string = menu_list[i][1];
            let url_endpoint = menu_list[i][3];
    
            console.log(`Creating Menu Item for: ${menu_item_string}`);
    
            const menu_item = <MenuOverlayButton
                                key={i}
                                id={i}
                                menu_name={menu_item_string}
                                url_endpoint ={url_endpoint}
                                app_state={this.props.app_state}
                                app_set_state={this.props.app_set_state}
                              />;
    
            menu_items.push(menu_item);
        }
    
        return menu_items
    }
    
    select_menu(isLoaded, isSignedIn, user) {
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

    render() {
        return (
            <div className={styles.menu_overlay_items_container}>
                {this.state.menu_items}
            </div>
        )
    }
}

export default MenuOverlay;