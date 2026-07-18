'use client';

import { Database, ImageDown, MailCheck, ScanLine } from 'lucide-react';
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

export function OwnerTools() {
    return (
        <div className="owner-tool-grid">
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
