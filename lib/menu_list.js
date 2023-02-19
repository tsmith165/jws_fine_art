export const SIGNED_OUT_MENU_LIST = [
    ["gallery", "Gallery", false, "/"],
    ["details", "Piece Details", false, "/details/1"],
    ["slideshow", "Slideshow", false, "/slideshow"],
    ["biography", "Biography", false, "/biography"],
    ["contact", "Contact", false, "/contact"],
    ["sign_in", "Sign In", false, "/signin"]
]

export const SIGNED_IN_MENU_LIST = [
    ["gallery", "Gallery", false, "/"],
    ["details", "Piece Details", false, "/details/1"],
    ["slideshow", "Slideshow", false, "/slideshow"],
    ["biography", "Biography", false, "/biography"],
    ["contact", "Contact", false, "/contact"],
    ["profile", "Profile", false, "/profile"],
    ["sign_out", "Sign Out", false, "/signout"]
]

export const ADMIN_MENU_LIST = [
    ["gallery", "Gallery", false, "/"],
    ["details", "Details", false, "/details/1"],
    ["slideshow", "Slideshow", false, "/slideshow"],
    ["biography", "Biography", false, "/biography"],
    ["contact", "Contact", false, "/contact"],
    ["profile", "Profile", false, "/profile"],
    ["edit_details", "Edit Details", true, "/edit/1"],
    ["management", "Management", true, "/manage"],
    ["orders", "Orders", true, "/orders"],
    ["sign_out", "Sign Out", false, "/signout"]
]

// eslint-disable-next-line import/no-anonymous-default-export
export default { SIGNED_OUT_MENU_LIST, SIGNED_IN_MENU_LIST, ADMIN_MENU_LIST }