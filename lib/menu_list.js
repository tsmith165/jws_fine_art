export const SIGNED_OUT_MENU_LIST = [
    ["gallery", "Gallery", false, "/"],
    ["details", "Piece Details", false, "/details/", true],
    ["slideshow", "Slideshow", false, "/slideshow", false],
    ["biography", "Biography", false, "/biography", false],
    ["contact", "Contact", false, "/contact", false],
    ["sign_in", "Sign In", false, "/signin", false]
]

export const SIGNED_IN_MENU_LIST = [
    ["gallery", "Gallery", false, "/"],
    ["details", "Piece Details", false, "/details/", true],
    ["slideshow", "Slideshow", false, "/slideshow", false],
    ["biography", "Biography", false, "/biography", false],
    ["contact", "Contact", false, "/contact", false],
    ["profile", "Profile", false, "/profile", false],
    ["sign_out", "Sign Out", false, "/signout", false]
]

export const ADMIN_MENU_LIST = [
    ["gallery", "Gallery", false, "/", false],
    ["details", "Details", false, "/details/", true],
    ["slideshow", "Slideshow", false, "/slideshow", false],
    ["biography", "Biography", false, "/biography", false],
    ["contact", "Contact", false, "/contact", false],
    ["profile", "Profile", false, "/profile", false],
    ["edit_details", "Edit Details", true, "/edit/", true],
    ["management", "Management", true, "/manage", false],
    ["orders", "Orders", true, "/orders", false],
    ["sign_out", "Sign Out", false, "/signout", false]
]

// eslint-disable-next-line import/no-anonymous-default-export
export default { SIGNED_OUT_MENU_LIST, SIGNED_IN_MENU_LIST, ADMIN_MENU_LIST }