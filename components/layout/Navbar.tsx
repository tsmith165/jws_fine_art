import PROJECT_CONSTANTS from '@/lib/constants';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SiteMenu from './SiteMenu';

export default function Navbar({ page }: { page: string }) {
    return (
        <nav className={'min-h-[80px] overflow-hidden bg-primary_dark p-0'}>
            <div className={'flex flex-row'}>
                <Link href="/gallery">
                    <div className={`!h-full w-[250px] max-w-[250px]`}>
                        <Image
                            className={`max-h-[80px] min-h-[80px] p-2.5`}
                            src="/jws_logo_small.png"
                            alt={`${PROJECT_CONSTANTS.SITE_FULL_NAME} logo`}
                            width={274}
                            height={80}
                            sizes="250px"
                            priority
                        />
                    </div>
                </Link>
                <div className={'absolute right-0 top-[40px] flex h-[40px] w-fit flex-row'}>
                    <Link href="https://www.instagram.com/jws_fineart/" target="_blank" rel="noreferrer">
                        <Image
                            className={'w-[40px] rounded-t-md bg-secondary_dark p-2 hover:bg-secondary_light'}
                            src="/instagram_icon_50.png"
                            alt="Instagram Link"
                            width={40}
                            height={40}
                        />
                    </Link>
                    <SiteMenu currentPage={page} />
                </div>
            </div>
        </nav>
    );
}
