'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';

import MenuOverlay from './menu/MenuOverlay';
import ProfileOverlay from './profile/ProfileOverlay';

import { IoIosMenu } from 'react-icons/io';
import { FaUserCircle } from 'react-icons/fa';

const ProfileIcon = () => {
    const { user } = useUser();

    if (user?.imageUrl) {
        return (
            <Image
                src={user.imageUrl}
                alt="Profile"
                width={40}
                height={40}
                className="m-[5px] h-[40px] w-[40px] rounded-full border-2 border-primary_dark transition-colors group-hover:border-primary"
            />
        );
    }

    return <FaUserCircle className="h-[50px] w-[50px] fill-primary_dark px-[5px] py-[5px] group-hover:fill-primary" />;
};

const SiteMenu = ({ currentPage }: { currentPage: string }) => {
    const { isSignedIn } = useUser();

    return (
        <div className="flex h-full w-fit flex-row">
            <div className={`m-[5px] hidden rounded-md hover:bg-primary xxxs:flex`}>
                <Link href="https://www.instagram.com/jws_fineart/" target="_blank" rel="noreferrer" prefetch={false}>
                    <Image
                        className={'h-[40px] w-[40px] rounded-md p-[5px]'}
                        src="/icon/instagram_icon_50.png"
                        alt="Instagram Link"
                        width={40}
                        height={40}
                    />
                </Link>
            </div>
            {isSignedIn && (
                <div className="group p-0">
                    <ProfileIcon />
                    <div className="fixed right-0 top-[50px] z-50 hidden rounded-bl-md border-b-2 border-l-2 border-primary bg-secondary_dark group-hover:flex">
                        <ProfileOverlay />
                    </div>
                </div>
            )}
            <div className={`group p-0`}>
                <IoIosMenu className={`h-[50px] w-[50px] fill-primary_dark py-[5px] pr-2 group-hover:fill-primary`} />
                <div
                    className={
                        'fixed right-0 top-[50px] z-50 hidden h-fit w-[200px] rounded-bl-md border-b-2 border-l-2 border-primary bg-secondary_dark group-hover:flex'
                    }
                >
                    <MenuOverlay currentPage={currentPage} />
                </div>
            </div>
        </div>
    );
};

export default SiteMenu;
