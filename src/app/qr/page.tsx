import type { Metadata } from 'next';
import { SiteShell } from '@/components/lit-wall/SiteShell';
import QRCodePage from './QRCodePage';

export const metadata: Metadata = { title: 'Studio QR code', robots: { index: false, follow: false } };

export default function QrPage() {
    return (
        <SiteShell>
            <section className="lw-qr-page">
                <div>
                    <span className="lw-eyebrow">Studio utility</span>
                    <h1>Share Jill’s collection.</h1>
                    <p>Choose a print treatment, then save or print the code from your browser.</p>
                </div>
                <QRCodePage />
            </section>
        </SiteShell>
    );
}
