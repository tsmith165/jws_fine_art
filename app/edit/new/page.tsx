import PageLayout from '@/components/layout/PageLayout';
import { SignedIn } from '@clerk/nextjs';
import CreatePiece from './CreatePiece';

export default function NewPiecePage() {
    return (
        <SignedIn>
            <PageLayout page="/edit/new">
                <CreatePiece />
            </PageLayout>
        </SignedIn>
    );
}
