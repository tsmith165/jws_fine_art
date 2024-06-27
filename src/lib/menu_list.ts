type MenuItem = [string, string, boolean, string];

export const SIGNED_OUT_MENU_LIST: MenuItem[] = [
    ['home', 'Home', false, '/'],
    ['gallery', 'Gallery', false, '/gallery'],
    ['biography', 'Biography', false, '/biography'],
    ['slideshow', 'Slideshow', false, '/slideshow'],
    ['sign_in', 'Sign In', false, '/signin'],
];

export const SIGNED_IN_MENU_LIST: MenuItem[] = [
    ['home', 'Home', false, '/'],
    ['gallery', 'Gallery', false, '/gallery'],
    ['biography', 'Biography', false, '/biography'],
    ['slideshow', 'Slideshow', false, '/slideshow'],
    ['profile', 'Profile', false, '/profile'],
    ['sign_out', 'Sign Out', false, '/signout'],
];

export const ADMIN_MENU_LIST: MenuItem[] = [
    ['home', 'Home', false, '/'],
    ['gallery', 'Gallery', false, '/gallery'],
    ['biography', 'Biography', false, '/biography'],
    ['slideshow', 'Slideshow', false, '/slideshow'],
    ['profile', 'Profile', false, '/profile'],
    ['edit_details', 'Edit Details', true, '/edit'],
    ['management', 'Management', true, '/manage'],
    ['orders', 'Orders', true, '/orders'],
    ['admin', 'Admin', true, '/admin'],
    ['sign_out', 'Sign Out', false, '/signout'],
];

export const menu_list: [string, string, string][] = [
    ['gallery', 'Gallery', '/gallery'],
    ['slideshow', 'Slideshow', '/slideshow'],
    ['contact', 'Contact', '/contact'],
];
