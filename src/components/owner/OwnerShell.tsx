import { BarChart3, ExternalLink, Images, Inbox, LayoutDashboard, Mail, PackageCheck, Wrench } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

const navigation = [
    { href: '/admin', label: 'Today', detail: 'Tasks and studio health', icon: LayoutDashboard },
    { href: '/admin/artwork', label: 'Artwork', detail: 'Catalog, order, and archive', icon: Images },
    { href: '/admin/orders', label: 'Orders', detail: 'Sales and fulfillment', icon: PackageCheck },
    { href: '/admin/inbox', label: 'Inbox', detail: 'Collector inquiries', icon: Inbox },
    { href: '/admin/mailing', label: 'Mailing', detail: 'Audience and campaigns', icon: Mail },
    { href: '/admin/analytics', label: 'Analytics', detail: 'Traffic and artwork interest', icon: BarChart3 },
    { href: '/admin/tools', label: 'Tools', detail: 'Backups and site health', icon: Wrench },
] as const;

export function OwnerShell({ active, title, children }: { active: string; title: string; children: ReactNode }) {
    return (
        <div className="owner-shell">
            <aside className="owner-rail">
                <Link className="owner-brand" href="/admin">
                    <Image src="/logo/jws_logo_small.png" alt="" width={76} height={44} />
                    <span>
                        <strong>Jill Weeks Smith</strong>
                        <small>Studio manager</small>
                    </span>
                </Link>
                <nav aria-label="Owner workspace">
                    <span className="owner-nav-label">Workspace</span>
                    {navigation.map(({ href, label, detail, icon: Icon }) => (
                        <Link key={href} href={href} className={active === href ? 'is-active' : undefined}>
                            <Icon size={18} aria-hidden="true" />
                            <span>
                                <strong>{label}</strong>
                                <small>{detail}</small>
                            </span>
                        </Link>
                    ))}
                </nav>
                <Link className="owner-view-site" href="/" target="_blank">
                    <ExternalLink size={17} aria-hidden="true" />
                    <span>
                        <strong>View website</strong>
                        <small>Open the public site</small>
                    </span>
                </Link>
            </aside>
            <main className="owner-main">
                <header className="owner-topbar">
                    <span>JWS Fine Art</span>
                    <strong>{title}</strong>
                    <Link href="/" target="_blank">
                        View site <ExternalLink size={14} aria-hidden="true" />
                    </Link>
                    <span className="owner-avatar" aria-label="Jill Weeks Smith account">
                        J
                    </span>
                </header>
                <div className="owner-scroll">{children}</div>
            </main>
        </div>
    );
}

export function OwnerHeading({
    eyebrow,
    title,
    description,
    action,
}: {
    eyebrow: string;
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <header className="owner-heading">
            <div>
                <span>{eyebrow}</span>
                <h1>{title}</h1>
                <p>{description}</p>
            </div>
            {action}
        </header>
    );
}

export function OwnerStatus({ tone = 'neutral', children }: { tone?: 'neutral' | 'good' | 'warning'; children: ReactNode }) {
    return <span className={`owner-status is-${tone}`}>{children}</span>;
}
