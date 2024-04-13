import PROJECT_CONSTANTS from '@/lib/constants';
import React from 'react';
import Link from 'next/link';   
import Image from 'next/image';

import SiteMenu from './SiteMenu';

export default function Navbar({ page }: { page: string }) {
    console.log('Navbar: page=', page);

    return (
        <nav className={'min-h-[100px] overflow-hidden bg-secondary p-0'}>
            <div className={'flex flex-row'}>
                <Link href="/">
                    <div className={`!h-full w-[250px] max-w-[250px]`}>
                        <Image
                            className={`max-h-[100px] min-h-[100px] p-2.5`}
                            src="/jws_logo_small.png"
                            alt={`${PROJECT_CONSTANTS.SITE_FULL_NAME} logo`}
                            width={274}
                            height={80}
                            sizes="250px"
                        />
                    </div>
                </Link>
                <div className={'absolute right-0 top-[60px] flex h-[40px] w-fit flex-row md:top-[50px] md:h-[50px]'}>
                    <Link href="https://www.instagram.com/jws_fineart/" target="_blank" rel="noreferrer">
                        <Image
                            className={'w-[40px] rounded-t-md bg-dark p-2 hover:bg-light md:w-[50px]'}
                            src="/instagram_icon_50.png"
                            alt="Instagram Link"
                            width={50}
                            height={50}
                        />
                    </Link>
                    <SiteMenu />
                </div>
            </div>
        </nav>
    );
};
