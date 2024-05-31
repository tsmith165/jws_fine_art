import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'JWS Fine Art - Order Management',
    description: 'Order management for JWS Fine Art',
    keywords: 'Jill Weeks Smith, JWS Fine Art, Fine Art, Art, Artist, Oil Painting, Oil, Gallery, Jill, Weeks, Smith, Order, Management',
    applicationName: 'JWS Fine Art',
    icons: {
        icon: '/JWS_ICON_MAIN.png',
        shortcut: '/JWS_ICON_MAIN.png',
        apple: '/apple-icon.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Orders',
        description: 'Orders for JWS Fine Art',
        siteName: 'JWS Fine Art',
        url: 'https://www.jwsfineart.com',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'JWS Fine Art',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
};

import { db, verifiedTransactionsTable } from '@/db/db';
import { VerifiedTransactions } from '@/db/schema';

import PageLayout from '@/components/layout/PageLayout';
import Orders from '@/app/orders/orders';

export default async function Page() {
    const verified_list = await fetchVerifiedPayments();

    return (
        <PageLayout page="/orders">
            <Orders verified_list={verified_list} />
        </PageLayout>
    );
}

async function fetchVerifiedPayments(): Promise<VerifiedTransactions[]> {
    console.log(`Fetching verified payments with Drizzle`);
    const verified_list = await db.select().from(verifiedTransactionsTable);

    console.log('Verified Payments List (Next Line):');
    console.log(verified_list);

    for (let i = 0; i < verified_list.length; i++) {
        const date_string = new Date(verified_list[i].date).toUTCString();
        console.log(`Current Date: ${date_string}`);
        verified_list[i].date = date_string;
    }

    console.log('Verified Payments List (Next Line):');
    console.log(verified_list);

    return verified_list;
}
