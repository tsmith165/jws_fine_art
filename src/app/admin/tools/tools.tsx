'use client';

import { useState } from 'react';
import Link from 'next/link';
import DataBackup from './DataBackup';
import TestEmail from './TestEmail';
import GenerateSmallImages from './GenerateSmallImages';
import VerifyImageDimensions from './VerifyImageDimensions';

interface ToolsProps {
    activeTab: string;
}

const Tools: React.FC<ToolsProps> = ({ activeTab }) => {
    return (
        <div className="flex w-4/5 flex-col space-y-4">
            <div className="w-full rounded-lg bg-primary_dark text-lg font-bold text-secondary_dark">
                <div className="w-full rounded-t-md bg-primary_dark text-lg font-bold text-secondary_dark">
                    <div className="flex pt-1">
                        <Link
                            href="/admin/tools?tab=backup"
                            className={`rounded-t-md px-2 py-1 ${
                                activeTab === 'backup'
                                    ? 'bg-secondary_dark text-primary'
                                    : 'bg-primary text-secondary_dark hover:bg-secondary_dark hover:text-primary'
                            }`}
                        >
                            Data Backup
                        </Link>
                        <Link
                            href="/admin/tools?tab=email"
                            className={`rounded-t-md px-2 py-1 ${
                                activeTab === 'email'
                                    ? 'bg-secondary_dark text-primary'
                                    : 'bg-primary text-secondary_dark hover:bg-secondary_dark hover:text-primary'
                            }`}
                        >
                            Test Email
                        </Link>
                        <Link
                            href="/admin/tools?tab=small-images"
                            className={`rounded-t-md px-2 py-1 ${
                                activeTab === 'small-images'
                                    ? 'bg-secondary_dark text-primary'
                                    : 'bg-primary text-secondary_dark hover:bg-secondary_dark hover:text-primary'
                            }`}
                        >
                            Small Images
                        </Link>
                        <Link
                            href="/admin/tools?tab=verify-dimensions"
                            className={`rounded-t-md px-2 py-1 ${
                                activeTab === 'verify-dimensions'
                                    ? 'bg-secondary_dark text-primary'
                                    : 'bg-primary text-secondary_dark hover:bg-secondary_dark hover:text-primary'
                            }`}
                        >
                            Verify Dimensions
                        </Link>
                    </div>
                </div>
                <div className="rounded-b-lg bg-secondary p-4">
                    {activeTab === 'backup' && <DataBackup />}
                    {activeTab === 'email' && <TestEmail />}
                    {activeTab === 'small-images' && <GenerateSmallImages />}
                    {activeTab === 'verify-dimensions' && <VerifyImageDimensions />}
                </div>
            </div>
        </div>
    );
};

export default Tools;
