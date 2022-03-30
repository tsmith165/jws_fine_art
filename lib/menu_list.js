export const menu_list = [
    ["home", "Home", false, "/"],
    ["gallery", "Gallery", false, "/"],
    ["details", "Piece Details", false, "/details/1"],
    //["biography", "Biography", false, "/biography"]
]

export const admin_menu_list = [
    ["home", "Home", false, "/"],,
    ["admin", "Admin", false, "/admin"],
    ["gallery", "Gallery", false, "/"],
    ["details", "Piece Details", false, "/details/1"],
    ["management", "Management", true, "/manage"],
    ["edit_details", "Edit Details", true, "/details/edit"],
    ["logout", "Log Out", false, "/logout"]
]

// eslint-disable-next-line import/no-anonymous-default-export
export default {admin_menu_list, menu_list}