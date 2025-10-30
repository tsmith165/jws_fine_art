export const DEFAULT_MENU_LIST: [string, string, boolean, string][] = [
    ['home', 'Home', false, '/'],
    ['biography', 'Biography', false, '/biography'],
    ['slideshow', 'Slideshow', false, '/slideshow'],
    ['events', 'Events', false, '/events'],
    ['faq', 'FAQ', false, '/faq'],
    ['contact', 'Contact', false, '/contact'],
];

export const SIGNED_IN_MENU_LIST: [string, string, boolean, string][] = [...DEFAULT_MENU_LIST, ['profile', 'Profile', false, '/profile']];

export const ADMIN_MENU_LIST: [string, string, boolean, string][] = [
    ...DEFAULT_MENU_LIST,
    ['profile', 'Profile', false, '/profile'],
    ['edit_details', 'Edit Details', true, '/admin/edit'],
    ['management', 'Management', true, '/admin/manage'],
    ['orders', 'Orders', true, '/admin/orders'],
    ['tools', 'Tools', true, '/admin/tools'],
];

export const navbar_menu_list: [string, string, string][] = [
    ['gallery', 'Gallery', '/'],
    ['slideshow', 'Slideshow', '/slideshow'],
    ['biography', 'Biography', '/biography'],
];

export const short_navbar_menu_list: [string, string, string][] = [
    ['gallery', 'Gallery', '/'],
    ['slideshow', 'Slideshow', '/slideshow'],
    ['biography', 'Bio', '/biography'],
];
