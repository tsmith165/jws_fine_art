import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SiteShell } from '@/components/lit-wall/SiteShell';
import { readPublicArtworks } from '@/data/artworkReads';

export const metadata: Metadata = {
    title: 'Studio & Story',
    description: 'Meet San Diego artist Jill Weeks Smith and learn about her oil painting and printmaking practice.',
    alternates: { canonical: '/studio' },
};

export default async function StudioPage() {
    const pieces = await readPublicArtworks();
    const studioImages = pieces.filter((piece) => piece.image_path).slice(0, 3);
    return (
        <SiteShell newsletter>
            <section className="lw-studio-hero lw-band">
                <div className="lw-studio-portrait">
                    <Image
                        src="/bio/jill-weeks-smith-portrait.jpg"
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
                <div className="lw-practice-content">
                    <span className="lw-eyebrow">The practice</span>
                    <h2>Light, texture, and what is often overlooked.</h2>
                    <p>
                        Jill began painting in oil at twelve. Her practice moves between direct observation, remembered places, and
                        experiments with the tools and surfaces that let a moment remain alive.
                    </p>
                    <p>
                        Oil is where color and atmosphere live. Printmaking trades softness for pressure, hard edges, and the moment the
                        image is revealed.
                    </p>
                </div>
            </section>
            <section className="lw-timeline lw-band">
                <header>
                    <span className="lw-eyebrow">A working life</span>
                    <h2>From the first brushstroke to the studio today.</h2>
                </header>
                <div className="lw-timeline-layout">
                    <ol>
                        <li>
                            <strong>San Diego beginnings</strong>
                            <p>A local artist and family friend mentored Jill in oil painting from the age of twelve.</p>
                        </li>
                        <li>
                            <strong>Utah State University</strong>
                            <p>
                                Majored in Fine Art and minored in Interior Design. Jill worked as a commissioned silk screen and print
                                artist during college and after graduation.
                            </p>
                        </li>
                        <li>
                            <strong>Northern California</strong>
                            <p>
                                Alongside coaching, Jill served as an art docent and continued exhibiting through galleries, art walks, and
                                regional fairs.
                            </p>
                        </li>
                        <li>
                            <strong>Southern California</strong>
                            <p>A studio practice built on light and atmosphere.</p>
                        </li>
                    </ol>
                    {studioImages.length > 0 && (
                        <div className="lw-timeline-media" aria-label="Selected work from Jill's studio">
                            {studioImages.map((piece, index) => (
                                <figure key={piece.id} className={index === 0 ? 'is-featured' : ''}>
                                    <Image
                                        src={piece.image_path}
                                        alt={piece.title}
                                        fill
                                        sizes="(max-width: 760px) 92vw, 24vw"
                                        quality={92}
                                    />
                                </figure>
                            ))}
                        </div>
                    )}
                </div>
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
