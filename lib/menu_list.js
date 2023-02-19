export const signed_out_menu_list = [
    ["gallery", "Gallery", false, "/"],
    ["details", "Piece Details", false, "/details/1"],
    ["slideshow", "Slideshow", false, "/slideshow"],
    ["biography", "Biography", false, "/biography"],
    ["contact", "Contact", false, "/contact"],
    ["sign_in", "Sign In", false, "/signin"]
]

export const signed_in_menu_list = [
    ["gallery", "Gallery", false, "/"],
    ["details", "Piece Details", false, "/details/1"],
    ["slideshow", "Slideshow", false, "/slideshow"],
    ["biography", "Biography", false, "/biography"],
    ["contact", "Contact", false, "/contact"],
    ["sign_out", "Sign Out", false, "/signout"]
]

export const admin_menu_list = [
    ["gallery", "Gallery", false, "/"],
    ["details", "Details", false, "/details/1"],
    ["slideshow", "Slideshow", false, "/slideshow"],
    ["biography", "Biography", false, "/biography"],
    ["contact", "Contact", false, "/contact"],
    // ["users", "Users", false, "/users"],
    // ["admin", "Admin", false, "/admin"],
    ["edit_details", "Edit Details", true, "/edit/1"],
    ["management", "Management", true, "/manage"],
    ["orders", "Orders", true, "/orders"],
    ["sign_out", "Sign Out", false, "/signout"]
]

// eslint-disable-next-line import/no-anonymous-default-export
export default { admin_menu_list, signed_out_menu_list, signed_in_menu_list }