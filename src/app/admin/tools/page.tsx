import { OwnerHeading, OwnerShell } from '@/components/owner/OwnerShell';
import { OwnerTools } from '@/components/owner/OwnerTools';

export const dynamic = 'force-dynamic';

export default function OwnerToolsPage() {
    return (
        <OwnerShell active="/admin/tools" title="Tools">
            <section className="owner-content">
                <OwnerHeading
                    eyebrow="Site health"
                    title="Tools"
                    description="Observable, owner-only utilities for backups, email verification, and image health. Each operation reports its result before you leave the page."
                />
                <OwnerTools />
            </section>
        </OwnerShell>
    );
}
