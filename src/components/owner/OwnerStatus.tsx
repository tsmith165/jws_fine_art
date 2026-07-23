import type { ReactNode } from 'react';

export function OwnerStatus({ tone = 'neutral', children }: { tone?: 'neutral' | 'good' | 'warning'; children: ReactNode }) {
    return <span className={`owner-status is-${tone}`}>{children}</span>;
}
