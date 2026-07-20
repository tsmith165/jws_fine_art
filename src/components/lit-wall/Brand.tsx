import Image from 'next/image';
import Link from 'next/link';

export function Brand({ compact = false }: { compact?: boolean }) {
    return (
        <Link href="/" className={`lw-brand${compact ? ' is-compact' : ''}`} aria-label="Jill Weeks Smith Fine Art home">
            <Image
                src="/logo/JWS_ICON_SECONDARY_152.png"
                alt=""
                width={152}
                height={152}
                priority
                className="lw-brand-signature"
            />
            <span>
                <strong>Jill Weeks Smith</strong>
                <small>Fine Art</small>
            </span>
        </Link>
    );
}
