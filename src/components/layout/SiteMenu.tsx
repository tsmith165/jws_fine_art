import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

import MenuOverlay from './menu/MenuOverlay';

import { IoIosMenu } from 'react-icons/io';

const SiteMenu = ({ currentPage }: { currentPage: string }) => {
    return (
        <div className="flex h-full w-fit flex-row">
            <div className={`group hidden p-0 pr-1 xxxs:flex`}>
                <Link href="https://www.instagram.com/jws_fineart/" target="_blank" rel="noreferrer" prefetch={false}>
                    <Image
                        className={'my-[10px] h-[30px] w-[30px] rounded-t-md'}
                        src="/icon/instagram_icon_50.png"
                        alt="Instagram Link"
                        width={40}
                        height={40}
                    />
                </Link>
            </div>
            <div className={`group p-0`}>
                <IoIosMenu className={`h-[50px] w-[50px] fill-primary py-[5px] pr-2 group-hover:fill-primary_dark`} />
                <div
                    className={
                        'absolute right-0 top-[50px] z-50 hidden h-fit w-[160px] rounded-bl-md border-b-2 border-l-2 border-primary_dark bg-secondary_light group-hover:flex'
                    }
                >
                    <MenuOverlay currentPage={currentPage} />
                </div>
            </div>
        </div>
    );
};

export default SiteMenu;
