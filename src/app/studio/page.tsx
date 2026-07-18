import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SiteShell } from '@/components/lit-wall/SiteShell';

export const metadata: Metadata = {
    title: 'Studio & Story',
    description: 'Meet San Diego artist Jill Weeks Smith and learn about her oil painting and printmaking practice.',
    alternates: { canonical: '/studio' },
};

export default function StudioPage() {
    return (
        <SiteShell newsletter>
            <section className="lw-studio-hero lw-band">
                <div className="lw-studio-portrait">
                    <Image
                        src="/bio/bio_pic_updated_small.jpg"
                        alt="Jill Weeks Smith"
                        fill
                        sizes="(max-width: 760px) 92vw, 40vw"
                        priority
                    />
                </div>
                <div>
                    <span className="lw-eyebrow">Studio & story</span>
                    <h1>A life spent noticing.</h1>
                    <blockquote>“My work captures moments I can’t let go of, so I can revisit often and bring others with me.”</blockquote>
                    <p>
                        Jill Weeks Smith is a San Diego artist working in oil painting, relief etching, and intaglio. Her practice follows
                        changing light, intimate landscapes, and the character of places that might otherwise pass unnoticed.
                    </p>
                </div>
            </section>
            <section className="lw-practice lw-band lw-band-raised">
                <span className="lw-eyebrow">The practice</span>
                <div>
                    <h2>Light, texture, and what is often overlooked.</h2>
                    <p>
                        Jill began painting in oil at twelve. Her practice moves between direct observation, remembered places, and
                        experiments with the tools and surfaces that let a moment remain alive.
                    </p>
                    <p>
                        Oil offers color and atmosphere. Printmaking answers with restraint, pressure, and the satisfaction of an image
                        revealed.
                    </p>
                </div>
            </section>
            <section className="lw-timeline lw-band">
                <header>
                    <span className="lw-eyebrow">A working life</span>
                    <h2>From the first lesson to the present studio.</h2>
                </header>
                <ol>
                    <li>
                        <strong>San Diego beginnings</strong>
                        <p>A local artist and family friend mentored Jill in oil painting from the age of twelve.</p>
                    </li>
                    <li>
                        <strong>Utah State University</strong>
                        <p>Fine Art with an emphasis in Oil Painting, alongside a minor in Interior Design.</p>
                    </li>
                    <li>
                        <strong>Northern California</strong>
                        <p>Gallery exhibitions, publications, art walks, and fine art fairs throughout Sacramento and Lake Tahoe.</p>
                    </li>
                    <li>
                        <strong>Back to the studio</strong>
                        <p>A renewed focus on intimate paintings, printmaking, and work that can become part of daily life.</p>
                    </li>
                </ol>
            </section>
            <section className="lw-studio-cta lw-band lw-band-raised">
                <h2>Find the work that stays with you.</h2>
                <div>
                    <Link className="lw-button lw-button-brass" href="/work">
                        Explore the collection <ArrowRight size={16} />
                    </Link>
                    <Link className="lw-button lw-button-ghost" href="/contact">
                        Contact the studio
                    </Link>
                </div>
            </section>
        </SiteShell>
    );
}
