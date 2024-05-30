'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';

import MenuOverlay from './menu/MenuOverlay';

import { IoIosMenu } from 'react-icons/io';
import { MdAccountCircle } from 'react-icons/md';

const SiteMenu = ({ currentPage }: { currentPage: string }) => {
    const [isMenuOpen, setMenuOpen] = useState(false);

    const handleMenuToggle = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        setMenuOpen(!isMenuOpen);
    };

    // get user signed in / signed out state
    const { user, isSignedIn } = useUser();

    return (
        <div className="flex w-fit flex-row">
            {/* Account Profile Button */}
            <div className="group !h-[40px] !w-[40px] rounded-t-md bg-secondary_dark p-1 hover:bg-secondary_light">
                {isSignedIn ? (
                    <UserButton
                        appearance={{
                            userProfile: {
                                elements: {
                                    breadcrumbs: '',
                                },
                            },
                        }}
                    />
                ) : (
                    <Link href="/signin" aria-label="Sign in">
                        <MdAccountCircle className="h-full w-full group-hover:fill-primary_dark" />
                    </Link>
                )}
            </div>

            {/* Hamburger Button */}
            <div className={`p-0`}>
                <div
                    className={`group h-full w-full rounded-t-md bg-secondary_dark p-[2.5px] hover:bg-secondary_light ${isMenuOpen ? 'bg-secondary' : 'bg-secondary_dark'}`}
                    onClick={handleMenuToggle}
                >
                    <IoIosMenu className={`h-full w-[40px] group-hover:fill-primary_dark`} />
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
