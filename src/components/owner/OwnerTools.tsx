'use client';

import { Database, ImageDown, MailCheck, Ruler, ScanLine, PanelsTopLeft } from 'lucide-react';
import DataBackup from '@/app/admin/tools/DataBackup';
import GenerateSmallImages from '@/app/admin/tools/GenerateSmallImages';
import TestEmail from '@/app/admin/tools/TestEmail';
import VerifyImageDimensions from '@/app/admin/tools/VerifyImageDimensions';

const tools = [
    {
        title: 'Catalog export',
        detail: 'Download the current artwork catalog as an XLSX backup for independent review.',
        icon: Database,
        control: <DataBackup />,
    },
    {
        title: 'Test purchase email',
        detail: 'Send a controlled test of the owner purchase notification before changing commerce email content.',
        icon: MailCheck,
        control: <TestEmail />,
    },
    {
        title: 'Generate image variants',
        detail: 'Create only missing small variants. Original uploads are never recompressed or replaced.',
        icon: ImageDown,
        control: <GenerateSmallImages />,
    },
    {
        title: 'Verify image dimensions',
        detail: 'Compare stored dimensions with the source files and record corrections in Convex.',
        icon: ScanLine,
        control: <VerifyImageDimensions />,
    },
];

type WallHealth = {
    publishedCount: number;
    brokenCount: number;
    brokenWalls: Array<{ wallId: string; slug: string; title: string; issues: string[] }>;
};

export function OwnerTools({
    frameReadiness,
    wallHealth,
}: {
    frameReadiness: { total: number; missing: number; availableMissing: number; estimated: number; verified: number };
    wallHealth: WallHealth;
}) {
    return (
        <div className="owner-tool-grid">
            <article className="owner-card owner-tool">
                <span>
                    <Ruler size={18} /> Catalog readiness
                </span>
                <h2>Framed dimensions</h2>
                <p>
                    {frameReadiness.availableMissing
                        ? `${frameReadiness.availableMissing} available framed works still lack a usable outside size.`
                        : 'Every available framed work has a usable finished outside size.'}
                </p>
                <dl className="owner-tool-metrics">
                    <div>
                        <dt>Estimated</dt>
                        <dd>{frameReadiness.estimated}</dd>
                    </div>
                    <div>
                        <dt>Verified</dt>
                        <dd>{frameReadiness.verified}</dd>
                    </div>
                    <div>
                        <dt>Missing</dt>
                        <dd>{frameReadiness.missing}</dd>
                    </div>
                </dl>
                <a className="owner-button" href="/admin/categories">
                    Open measurement queue
                </a>
            </article>
            <article className="owner-card owner-tool">
                <span>
                    <PanelsTopLeft size={18} /> Published experience
                </span>
                <h2>Gallery health</h2>
                <p>
                    {wallHealth.brokenCount
                        ? `${wallHealth.brokenCount} published wall${wallHealth.brokenCount === 1 ? '' : 's'} reference artwork that can no longer render publicly.`
                        : `${wallHealth.publishedCount} published wall${wallHealth.publishedCount === 1 ? '' : 's'} checked with no broken artwork references.`}
                </p>
                {wallHealth.brokenWalls.length ? (
                    <ul className="owner-tool-issues">
                        {wallHealth.brokenWalls.map((wall) => (
                            <li key={wall.wallId}>
                                <strong>{wall.title}</strong>
                                <span>{wall.issues.join(' · ')}</span>
                            </li>
                        ))}
                    </ul>
                ) : null}
                <a className="owner-button" href="/admin/walls">
                    Manage gallery
                </a>
            </article>
            {tools.map(({ title, detail, icon: Icon, control }) => (
                <article className="owner-card owner-tool" key={title}>
                    <span>
                        <Icon size={18} /> Site utility
                    </span>
                    <h2>{title}</h2>
                    <p>{detail}</p>
                    <div className="owner-tool-control">{control}</div>
                </article>
            ))}
        </div>
    );
}
