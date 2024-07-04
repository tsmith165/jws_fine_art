import React, { ReactNode } from 'react';
import Navbar from '@/components/layout/Navbar';

type PageLayoutProps = {
    children: ReactNode;
    page: string;
};

export default function PageLayout({ children, page }: PageLayoutProps) {
    return (
        <div className="h-[100dvh]">
            <Navbar page={page} />
            <main className="h-[calc(100dvh-50px)] bg-stone-900">{children}</main>
        </div>
    );
}
