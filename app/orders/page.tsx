import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'JWS Fine Art - Order Management',
    description: 'Order management for JWS Fine Art',
    icons: {
        icon: '/JWS_ICON_MAIN.png',
    },
    openGraph: {
        siteName: 'JWS Fine Art',
        url: 'https://www.jwsfineart.com',
        images: '/og-image.png',
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
