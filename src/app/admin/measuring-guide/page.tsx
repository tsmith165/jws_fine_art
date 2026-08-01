import { Ruler } from 'lucide-react';
import { OwnerHeading, OwnerShell } from '@/components/owner/OwnerShell';

export default function FramedArtworkMeasuringGuidePage() {
    return (
        <OwnerShell active="/admin/categories" title="Measuring guide">
            <section className="owner-content owner-measuring-guide">
                <OwnerHeading
                    eyebrow="Framed artwork"
                    title="Measure the finished outside size"
                    description="Use the outermost edges of the complete frame so scale and packing decisions reflect what will actually hang on the wall."
                />
                <article className="owner-panel">
                    <Ruler size={28} aria-hidden="true" />
                    <ol>
                        <li>Stand the artwork upright on a stable surface.</li>
                        <li>Measure the full width from outside edge to outside edge.</li>
                        <li>Measure the full height the same way, including the entire external frame.</li>
                        <li>Record inches to the nearest quarter inch. For example, 15.25 means 15¼ inches.</li>
                        <li>For a floater frame, measure the outside of the floater frame, not the painted panel inside it.</li>
                        <li>Do not include removable wire, wall hooks, or temporary packing material.</li>
                        <li>For an irregular frame, use its widest and tallest outside points.</li>
                    </ol>
                    <p>
                        Leave verification unchecked if you are using the provisional estimate or cannot physically measure the work yet.
                        The work may remain public, but it stays in Needs Attention until the measurement is confirmed.
                    </p>
                </article>
            </section>
        </OwnerShell>
    );
}
