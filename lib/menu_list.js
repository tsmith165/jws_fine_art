export const menu_list = [
    ["gallery", "Gallery", false, "/"],
    ["details", "Piece Details", false, "/details/1"],
    //["biography", "Biography", false, "/biography"]
]

export const admin_menu_list = [
    ["gallery", "Gallery", false, "/"],
    ["details", "Details", false, "/details/1"],
    ["admin", "Admin", false, "/admin"],
    ["edit_details", "Edit Details", true, "/edit/1"],
    ["management", "Management", true, "/manage"]
]

// eslint-disable-next-line import/no-anonymous-default-export
export default { admin_menu_list, menu_list }