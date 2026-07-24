import { api } from '../../../../../convex/_generated/api';
import { getAuthenticatedOwnerConvexClient } from '@/data/ownerConvex';

export const dynamic = 'force-dynamic';

function parseRange(value: string | null) {
    const parsed = Number(value);
    return [30, 90, 365, 3650].includes(parsed) ? parsed : 90;
}

function csvCell(value: string | number) {
    const string = String(value);
    return /[",\n]/.test(string) ? `"${string.replaceAll('"', '""')}"` : string;
}

export async function GET(request: Request) {
    const rangeDays = parseRange(new URL(request.url).searchParams.get('range'));
    const client = await getAuthenticatedOwnerConvexClient('export a business summary');
    const data = await client.query(api.ownerBusiness.overview, { rangeDays });
    const rows: Array<[string, string | number]> = [
        ['Reporting period (days)', rangeDays],
        ['Gross collected (cents)', data.commerce.grossCents],
        ['Shipping collected (cents)', data.commerce.shippingCents],
        ['Tax recorded (cents)', data.commerce.taxCents],
        ['Refunded (cents)', data.commerce.refundedCents],
        ['Net collected before fees (cents)', data.commerce.netCollectedCents],
        ['Orders', data.commerce.orderCount],
        ['Average order (cents)', data.commerce.averageOrderCents],
        ['Checkout starts', data.commerce.checkoutCreated],
        ['Checkout payments', data.commerce.checkoutPaid],
        ['Checkout conversion (%)', data.commerce.conversionPercent],
        ['Active subscribers', data.mailing.activeSubscribers],
        ['Suppressed subscribers', data.mailing.suppressedSubscribers],
        ['Open operational findings', data.alerts.length],
    ];
    const csv = ['Metric,Value', ...rows.map((row) => row.map(csvCell).join(','))].join('\n');
    return new Response(csv, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="jws-business-summary-${new Date().toISOString().slice(0, 10)}.csv"`,
            'Cache-Control': 'private, no-store',
        },
    });
}
