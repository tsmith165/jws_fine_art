import Image from 'next/image';
import Link from 'next/link';

export function Brand({ compact = false }: { compact?: boolean }) {
    return (
        <Link href="/" className={`lw-brand${compact ? 'is-compact' : ''}`}>
            <Image src="/logo/jws_logo_small.png" alt="" width={85} height={45} priority className="lw-brand-signature" />
            <span>
                <strong>Jill Weeks Smith</strong>
            </span>
        </Link>
    );
}
