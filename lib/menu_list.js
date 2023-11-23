export const SIGNED_OUT_MENU_LIST = [
    ['gallery', 'Gallery', false, '/gallery'],
    ['details', 'Piece Details', false, '/details/1', true],
    ['slideshow', 'Slideshow', false, '/slideshow', false],
    ['biography', 'Biography', false, '/biography', false],
    ['socials', 'Socials', false, '/socials', false],
    ['contact', 'Contact', false, '/contact', false],
    ['sign_in', 'Sign In', false, '/signin', false],
];

export const SIGNED_IN_MENU_LIST = [
    ['gallery', 'Gallery', false, '/gallery'],
    ['details', 'Piece Details', false, '/details/1', true],
    ['slideshow', 'Slideshow', false, '/slideshow', false],
    ['biography', 'Biography', false, '/biography', false],
    ['socials', 'Socials', false, '/socials', false],
    ['contact', 'Contact', false, '/contact', false],
    ['profile', 'Profile', false, '/profile', false],
    ['sign_out', 'Sign Out', false, '/signout', false],
];

export const ADMIN_MENU_LIST = [
    ['gallery', 'Gallery', false, '/gallery', false],
    ['details', 'Details', false, '/details/1', true],
    ['slideshow', 'Slideshow', false, '/slideshow', false],
    ['biography', 'Biography', false, '/biography', false],
    ['socials', 'Socials', false, '/socials', false],
    ['contact', 'Contact', false, '/contact', false],
    ['profile', 'Profile', false, '/profile', false],
    ['edit_details', 'Edit Details', true, '/edit/1', true],
    ['management', 'Management', true, '/manage', false],
    ['orders', 'Orders', true, '/orders', false],
    ['admin', 'Admin', true, '/admin', false],
    ['sign_out', 'Sign Out', false, '/signout', false],
];

export default { SIGNED_OUT_MENU_LIST, SIGNED_IN_MENU_LIST, ADMIN_MENU_LIST };
