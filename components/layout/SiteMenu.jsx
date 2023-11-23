'use client';

import { useState } from 'react';
import Link from 'next/link';

import MenuOverlay from './menu/MenuOverlay';
import MenuIcon from '@mui/icons-material/Menu';

import { SignedIn, SignedOut, UserButton, ClerkLoading } from '@clerk/nextjs';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const SiteMenu = () => {
    const [isMenuOpen, setMenuOpen] = useState(false);

    const handleMenuToggle = (e) => {
        e.preventDefault();
        setMenuOpen(!isMenuOpen);
    };

    return (
        <div className="flex w-fit flex-row">
            {/* Account Profile Button */}
            <div className="p-2.5 bg-dark rounded-t-md hover:bg-light">
                <SignedIn>
                    <UserButton
                        className="!h-[40px] !w-[40px] bg-dark p-[2.5px] hover:bg-light md:!h-[50px] md:!w-[50px]"
                        appearance={{
                            userProfile: { elements: { breadcrumbs: 'bg-slate-500' } },
                        }}
                    />
                </SignedIn>
                <SignedOut>
                    <Link href="/signin">
                        <div className="h-full w-full">
                            <AccountCircleIcon className="!h-[40px] !w-[40px] rounded-t-md bg-dark !fill-light p-[2.5px] hover:bg-light hover:!fill-dark md:!h-[50px] md:!w-[50px]" />
                        </div>
                    </Link>
                </SignedOut>
                <ClerkLoading>
                    <Link href="/signin">
                        <div className="h-full w-full">
                            <AccountCircleIcon className="!h-[40px] !w-[40px] rounded-t-md bg-dark !fill-light p-[2.5px] hover:bg-light hover:!fill-dark md:!h-[50px] md:!w-[50px]" />
                        </div>
                    </Link>
                </ClerkLoading>
            </div>

            {/* Hamburger Button */}
            <div className={`p-0`} onMouseLeave={() => setMenuOpen(false)}>
                <div className={`h-full w-full`} onClick={handleMenuToggle}>
                    <MenuIcon
                        className={`!h-[40px] !w-[40px] bg-dark p-[2.5px] ${
                            isMenuOpen ? 'bg-light !fill-dark ' : 'bg-dark !fill-light'
                        } rounded-t-md hover:bg-light hover:!fill-dark md:!h-[50px] md:!w-[50px]`}
                    />
                </div>

                {isMenuOpen && (
                    <div className={'absolute right-0 top-[50px] z-50 h-fit w-[200px] border-b-2 border-l-2 border-secondary bg-light'}>
                        <MenuOverlay />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SiteMenu;
