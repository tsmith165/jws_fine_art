import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Camera, PackageCheck, ShieldCheck, Truck } from 'lucide-react';
import { ShippingEstimator } from '@/components/lit-wall/ShippingEstimator';
import { SiteShell } from '@/components/lit-wall/SiteShell';

export const metadata: Metadata = {
    title: 'Shipping & Artwork Care',
    description: 'How original artwork by Jill Weeks Smith is packed, insured, delivered, and protected in transit.',
    alternates: { canonical: '/shipping' },
};

export default function ShippingPage() {
    return (
        <SiteShell>
            <header className="lw-page-intro lw-shipping-intro">
                <span className="lw-eyebrow">Shipping & artwork care</span>
                <h1>Careful packing for the journey home.</h1>
                <p>
                    Every shipped work is packed for its size and frame, then sent with tracking and insurance. Local pickup is also
                    available in San Diego County. Use the estimator to see the fixed tier price.
                </p>
            </header>
            <section className="lw-shipping-guide lw-band">
                <div className="lw-shipping-principles">
                    <article>
                        <PackageCheck size={22} />
                        <h2>Packed by the studio</h2>
                        <p>Corner protection, surface clearance, and double boxing are selected for the individual work.</p>
                    </article>
                    <article>
                        <Truck size={22} />
                        <h2>Fixed by size</h2>
                        <p>Small, medium, and large works use clear prices with frame protection included when needed.</p>
                    </article>
                    <article>
                        <ShieldCheck size={22} />
                        <h2>Protected in transit</h2>
                        <p>Shipments include tracking and insurance. Keep all packaging until the work has been inspected.</p>
                    </article>
                    <article>
                        <Camera size={22} />
                        <h2>See more before buying</h2>
                        <p>Jill can provide additional photographs or a short video of the artwork on request.</p>
                    </article>
                </div>
                <ShippingEstimator />
            </section>
            <section className="lw-shipping-policy lw-band lw-band-raised">
                <div>
                    <span className="lw-eyebrow">If damage occurs</span>
                    <h2>Document the package and contact the studio.</h2>
                </div>
                <div>
                    <p>
                        Sales are final except when artwork is damaged in transit. If damage occurs, photograph the unopened package, the
                        packing materials, and the artwork, keep every part of the shipment, and contact Jill promptly so the insurance
                        claim and refund can be handled.
                    </p>
                    <p>
                        Checkout adds the fixed insured-delivery price for the artwork’s size and framing. Local pickup is free. Work larger
                        than 24 × 30 inches and all international deliveries require a studio quote before payment.
                    </p>
                    <p>Sales tax is included in the displayed price where applicable.</p>
                    <Link className="lw-button lw-button-brass" href="/contact?kind=general">
                        Ask about shipping <ArrowRight size={16} />
                    </Link>
                </div>
            </section>
        </SiteShell>
    );
}
