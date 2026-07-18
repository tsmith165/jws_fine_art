'use client';

import { ArrowRight, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Brand } from './Brand';

const links = [
    ['/work', 'Work'],
    ['/studio', 'Studio'],
    ['/commissions', 'Commissions'],
    ['/contact', 'Contact'],
] as const;

export function SiteHeader() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    useEffect(() => setOpen(false), [pathname]);
    return (
        <header className="lw-header">
            <Brand />
            <nav className="lw-nav" aria-label="Primary navigation">
                {links.map(([href, label]) => (
                    <Link key={href} href={href} aria-current={pathname.startsWith(href) ? 'page' : undefined}>
                        {label}
                    </Link>
                ))}
            </nav>
            <Link className="lw-button lw-button-brass lw-header-cta" href="/work?availability=available">
                Available work <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <button
                className="lw-icon-button lw-menu-button"
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
                onClick={() => setOpen(!open)}
            >
                {open ? <X size={22} /> : <Menu size={22} />}
            </button>
            <nav className={`lw-mobile-nav ${open ? 'is-open' : ''}`} aria-label="Mobile navigation">
                {links.map(([href, label]) => (
                    <Link key={href} href={href}>
                        {label} <ArrowRight size={16} />
                    </Link>
                ))}
                <Link href="/work?availability=available">
                    Available work <ArrowRight size={16} />
                </Link>
            </nav>
        </header>
    );
}
