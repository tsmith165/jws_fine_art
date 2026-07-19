import { Instagram } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Brand } from './Brand';
import { Newsletter } from './Newsletter';
import { SiteHeader } from './SiteHeader';

export function SiteShell({ children, newsletter = false }: { children: ReactNode; newsletter?: boolean }) {
    return (
        <div className="lw-site">
            <SiteHeader />
            <main>{children}</main>
            {newsletter && <Newsletter />}
            <footer className="lw-footer">
                <Brand compact />
                <p>San Diego, California. Oil paintings, pastels, and original prints by Jill Weeks Smith.</p>
                <div>
                    <Link href="/contact#collector-guide">Collector guide</Link>
                    <Link href="/contact#shipping">Shipping details</Link>
                    <Link href="https://www.instagram.com/jws_fineart/" target="_blank" rel="noreferrer">
                        <Instagram size={15} /> Instagram
                    </Link>
                </div>
            </footer>
        </div>
    );
}
