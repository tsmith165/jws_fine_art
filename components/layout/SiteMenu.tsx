'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SignedIn, SignedOut, UserButton, ClerkLoading } from '@clerk/nextjs';

import MenuOverlay from './menu/MenuOverlay';

import { IoMenu } from 'react-icons/io5';
import { MdAccountCircle } from 'react-icons/md';

const SiteMenu = ({ currentPage }: { currentPage: string }) => {
    const [isMenuOpen, setMenuOpen] = useState(false);

    const handleMenuToggle = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        setMenuOpen(!isMenuOpen);
    };

    return (
        <div className="flex w-fit flex-row">
            {/* Account Profile Button */}
            <div className="hover:!fill-dark !h-[40px] !w-[40px] rounded-t-md bg-secondary_dark !fill-secondary_light p-1 hover:bg-secondary_light">
                <SignedIn>
                    <UserButton
                        appearance={{
                            userProfile: {
                                elements: {
                                    breadcrumbs: '',
                                },
                            },
                        }}
                    />
                </SignedIn>
                <SignedOut>
                    <Link href="/signin">
                        <MdAccountCircle className="h-full w-full" />
                    </Link>
                </SignedOut>
                <ClerkLoading>
                    <Link href="/signin">
                        <MdAccountCircle className="h-full w-full" />
                    </Link>
                </ClerkLoading>
            </div>

            {/* Hamburger Button */}
            <div className={`p-0`} onMouseLeave={() => setMenuOpen(false)}>
                <div className={`h-full w-full`} onClick={handleMenuToggle}>
                    <IoMenu
                        className={`!h-[40px] !w-[40px] bg-secondary_dark p-[2.5px] ${
                            isMenuOpen ? 'bg-secondary_light !fill-primary_dark' : 'bg-secondary_dark !fill-secondary_light'
                        } hover:!fill-dark rounded-t-md hover:bg-secondary_light`}
                    />
                </div>

                {isMenuOpen && (
                    <div
                        className={
                            'absolute right-0 top-[40px] z-50 h-fit w-[200px] rounded-bl-md border-b-2 border-l-2 border-primary_dark bg-secondary_light'
                        }
                    >
                        <MenuOverlay currentPage={currentPage} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SiteMenu;
