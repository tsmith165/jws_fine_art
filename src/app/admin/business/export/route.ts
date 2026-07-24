import { api } from '../../../../../convex/_generated/api';
import { getAuthenticatedOwnerConvexClient } from '@/data/ownerConvex';

export const dynamic = 'force-dynamic';

function parseRange(value: string | null) {
    if (value === 'year') {
        const now = new Date();
        return Math.max(1, Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (24 * 60 * 60 * 1000)));
    }
    const parsed = Number(value);
    return [30, 90, 365, 3650].includes(parsed) ? parsed : 90;
}

function csvCell(value: string | number) {
    const string = String(value);
    return /[",\n]/.test(string) ? `"${string.replaceAll('"', '""')}"` : string;
}

function csvRow(cells: Array<string | number>) {
    return cells.map(csvCell).join(',');
}

export async function GET(request: Request) {
    const rangeDays = parseRange(new URL(request.url).searchParams.get('range'));
    const client = await getAuthenticatedOwnerConvexClient('export a business report');
    const data = await client.query(api.ownerBusiness.overview, { rangeDays });
    const summaryRows: Array<[string, string | number]> = [
        ['Reporting period (days)', rangeDays],
        ['Gross collected (cents)', data.commerce.grossCents],
        ['Shipping collected (cents)', data.commerce.shippingCents],
        ['Tax to set aside (cents)', data.commerce.taxSetAsideCents],
        ['CA-taxable orders', data.commerce.taxJurisdictions.ca],
        ['Interstate orders (CA exempt)', data.commerce.taxJurisdictions.interstate],
        ['International orders (CA exempt)', data.commerce.taxJurisdictions.international],
        ['Unclassified orders', data.commerce.taxJurisdictions.unclassified],
        ['Stripe Tax recorded (cents)', data.commerce.taxCents],
        ['Refunded (cents)', data.commerce.refundedCents],
        ['Net collected before fees (cents)', data.commerce.netCollectedCents],
        ['Orders', data.commerce.orderCount],
        ['Test orders excluded', data.commerce.testOrderCount],
        ['Average order (cents)', data.commerce.averageOrderCents],
        ['Checkout starts', data.commerce.checkoutCreated],
        ['Checkout payments', data.commerce.checkoutPaid],
        ['Checkout conversion (%)', data.commerce.conversionPercent],
        ['Active subscribers', data.mailing.activeSubscribers],
        ['Suppressed subscribers', data.mailing.suppressedSubscribers],
        ['Open operational findings', data.alerts.length],
    ];
    const sections = [
        ['Metric,Value', ...summaryRows.map((row) => csvRow(row))].join('\n'),
        [
            'Sales by destination',
            'Destination,Orders,Gross (cents)',
            ...data.commerce.salesByState.map((entry) => csvRow([entry.state, entry.orders, entry.grossCents])),
        ].join('\n'),
        [
            'Orders',
            'Purchased,Artwork,Source,Delivery,Destination state,Tax jurisdiction,Tax rate (bps),Amount paid (cents),Shipping (cents),Tax set aside (cents)',
            ...data.commerce.orderRows.map((order) =>
                csvRow([
                    order.purchasedOn ?? '',
                    order.artworkTitle,
                    order.source,
                    order.deliveryMethod,
                    order.destinationState,
                    order.taxJurisdiction ?? 'unclassified',
                    order.taxRateBps ?? 0,
                    order.amountPaidCents,
                    order.shippingPaidCents,
                    order.taxSetAsideCents,
                ]),
            ),
        ].join('\n'),
    ];
    const csv = sections.join('\n\n');
    return new Response(csv, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="jws-business-report-${new Date().toISOString().slice(0, 10)}.csv"`,
            'Cache-Control': 'private, no-store',
        },
    });
}
