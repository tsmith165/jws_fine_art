import PROJECT_CONSTANTS from '@/lib/constants';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SiteMenu from './SiteMenu';
import { menu_list } from '@/lib/menu_list';

export default function Navbar({ page }: { page: string }) {
    const non_selected_gradient = `from-secondary via-primary_dark to-secondary `;
    const non_selected_gradient_hover = `hover:from-primary_dark hover:via-primary hover:to-primary_dark`;
    const selected_gradient = `from-primary_dark via-primary to-primary_dark`;
    const selected_gradient_hover = `hover:from-secondary hover:via-primary_dark hover:to-secondary`;

    const navbar = menu_list.map(([menu_class_name, menu_full_name, url_endpoint]) => {
        let is_hidden = menu_class_name === 'slideshow' ? 'hidden md:flex' : menu_class_name === 'gallery' ? 'hidden xs:flex' : '';
        let gradient = page.includes(url_endpoint) ? selected_gradient : non_selected_gradient;
        let gradient_hover = page.includes(url_endpoint) ? selected_gradient_hover : non_selected_gradient_hover;
        return (
            <Link
                key={menu_class_name}
                href={url_endpoint}
                className={
                    `h-full cursor-pointer bg-clip-text pb-1 font-bold text-transparent ${is_hidden} ` +
                    `bg-gradient-to-r ${gradient} ${gradient_hover}`
                }
            >
                {menu_full_name}
            </Link>
        );
    });

    const halfLength = Math.ceil(navbar.length / 2);
    const leftNavbar = navbar.slice(0, halfLength);
    const rightNavbar = navbar.slice(halfLength);

    return (
        <nav className="flex h-[50px] w-full flex-row items-center justify-between bg-neutral-900 p-0">
            <Link href="/gallery" className="mx-4 flex h-[50px] md:hidden">
                <Image
                    src="/logo/jws_logo_small.png"
                    alt={`${PROJECT_CONSTANTS.SITE_FULL_NAME} logo`}
                    width={230}
                    height={60}
                    sizes="250px"
                    className="max-h-[50px] w-fit object-contain"
                />
            </Link>
            <div className="hidden flex-1 flex-row items-center justify-end space-x-4 md:flex">{leftNavbar}</div>
            <Link href="/gallery" className="mx-4 hidden h-[50px] items-center justify-center md:flex">
                <Image
                    src="/logo/jws_logo_small.png"
                    alt={`${PROJECT_CONSTANTS.SITE_FULL_NAME} logo`}
                    width={230}
                    height={60}
                    sizes="250px"
                    className="max-h-[50px] w-fit object-contain"
                />
            </Link>
            <div className="hidden flex-1 flex-row items-center justify-start space-x-4 md:flex">{rightNavbar}</div>
            <div className="flex w-full flex-row items-center justify-end space-x-4 md:hidden">{navbar}</div>

            <div className={'flex justify-end'}>
                <SiteMenu currentPage={page} />
            </div>
        </nav>
    );
}
