import { getAnalyticsData } from '@/lib/googleAnalytics';

export async function POST(req) {
    const passed_json = await req.json();
    console.log(`Received Request for Analytics Data`);

    if (!passed_json) {
        console.error(`Request body is undefined`);
        return Response.json({ error: "Request body is undefined" }, { status: 400 });
    }
    
    try {
        const data = await getAnalyticsData(passed_json);
        console.log(`Response (Next Line):`);
        console.log(data);
        return Response.json(data);
    } catch (error) {
        console.error('Error fetching analytics data:', error);
        return Response.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
    }
}
