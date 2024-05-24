export const SIGNED_OUT_MENU_LIST = [
    ['gallery', 'Gallery', false, '/gallery'],
    ['details', 'Piece Details', false, '/details', true],
    ['slideshow', 'Slideshow', false, '/slideshow', false],
    ['sign_in', 'Sign In', false, '/signin', false],
];

export const SIGNED_IN_MENU_LIST = [
    ['gallery', 'Gallery', false, '/gallery'],
    ['details', 'Piece Details', false, '/details', true],
    ['slideshow', 'Slideshow', false, '/slideshow', false],
    ['profile', 'Profile', false, '/profile', false],
    ['sign_out', 'Sign Out', false, '/signout', false],
];

export const ADMIN_MENU_LIST = [
    ['gallery', 'Gallery', false, '/gallery', false],
    ['details', 'Details', false, '/details', true],
    ['slideshow', 'Slideshow', false, '/slideshow', false],
    ['profile', 'Profile', false, '/profile', false],
    ['edit_details', 'Edit Details', true, '/edit', true],
    ['management', 'Management', true, '/manage', false],
    ['orders', 'Orders', true, '/orders', false],
    ['admin', 'Admin', true, '/admin', false],
    ['sign_out', 'Sign Out', false, '/signout', false],
];

export default { SIGNED_OUT_MENU_LIST, SIGNED_IN_MENU_LIST, ADMIN_MENU_LIST };
