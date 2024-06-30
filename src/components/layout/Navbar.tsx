import React from 'react';
import Link from 'next/link';
import SiteMenu from './SiteMenu';
import { navbar_menu_list, short_navbar_menu_list } from '@/lib/menu_list';

export default function Navbar({ page }: { page: string }) {
    const non_selected_gradient = `from-secondary via-primary_dark to-secondary `;
    const non_selected_gradient_hover = `hover:from-primary_dark hover:via-primary hover:to-primary_dark`;
    const selected_gradient = `from-primary_dark via-primary to-primary_dark`;
    const selected_gradient_hover = `hover:from-secondary hover:via-primary_dark hover:to-secondary`;

    const navbar = navbar_menu_list.map(([menu_class_name, menu_full_name, url_endpoint]) => {
        let gradient = page.includes(url_endpoint) ? selected_gradient : non_selected_gradient;
        let gradient_hover = page.includes(url_endpoint) ? selected_gradient_hover : non_selected_gradient_hover;
        return (
            <Link
                key={menu_class_name}
                href={url_endpoint}
                className={
                    `h-full cursor-pointer bg-clip-text font-bold text-transparent first:pl-0 ` +
                    `bg-gradient-to-r ${gradient} ${gradient_hover} ` +
                    (url_endpoint.includes('biography') ? 'hidden xxs:flex' : '')
                }
            >
                {menu_full_name}
            </Link>
        );
    });

    const short_navbar = short_navbar_menu_list.map(([menu_class_name, menu_full_name, url_endpoint]) => {
        let gradient = page.includes(url_endpoint) ? selected_gradient : non_selected_gradient;
        let gradient_hover = page.includes(url_endpoint) ? selected_gradient_hover : non_selected_gradient_hover;
        return (
            <Link
                key={menu_class_name}
                href={url_endpoint}
                className={
                    `h-full cursor-pointer bg-clip-text font-bold text-transparent first:pl-0 ` +
                    `bg-gradient-to-r ${gradient} ${gradient_hover} `
                }
            >
                {menu_full_name}
            </Link>
        );
    });

    return (
        <nav className="flex h-[50px] w-full flex-row items-center justify-between bg-stone-400 p-0">
            <div className="hidden w-full flex-row items-center justify-start space-x-3 pl-4 xs:flex xs:justify-center">{navbar}</div>
            <div className="flex w-full flex-row items-center justify-start space-x-3 pl-4 xs:hidden">{short_navbar}</div>
            <div className={'absolute right-0'}>
                <SiteMenu currentPage={page} />
            </div>
        </nav>
    );
}
