import React, { ReactNode, Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import PostHogPageView from '@/app/PostHogPageView';

type PageLayoutProps = {
    children: ReactNode;
    page: string;
};

export default function PageLayout({ children, page }: PageLayoutProps) {
    return (
        <div className="h-[100dvh]">
            <Suspense>
                <PostHogPageView />
            </Suspense>
            <Navbar page={page} />
            <main className="h-[calc(100dvh-50px)] bg-stone-900">{children}</main>
        </div>
    );
}
