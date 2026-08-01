import { Instagram } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Brand } from './Brand';
import { Newsletter } from './Newsletter';
import { SiteHeader } from './SiteHeader';
import { readPublishedGalleryWalls } from '@/data/galleryWallReads';

export async function SiteShell({ children, newsletter = false }: { children: ReactNode; newsletter?: boolean }) {
    const hasViewingRoom = (await readPublishedGalleryWalls()).length > 0;
    return (
        <div className="lw-site">
            <SiteHeader viewingRoom={hasViewingRoom} />
            <main>{children}</main>
            {newsletter && <Newsletter />}
            <footer className="lw-footer">
                <Brand />
                <p>San Diego, California. Oil painting, soft pastel, lino cut, and intaglio by Jill Weeks Smith.</p>
                <div>
                    <Link href="/contact#collector-guide">Collector guide</Link>
                    <Link href="/shipping">Shipping details</Link>
                    <Link href="https://www.instagram.com/jws_fineart/" target="_blank" rel="noreferrer">
                        <Instagram size={15} /> Instagram
                    </Link>
                </div>
            </footer>
        </div>
    );
}
