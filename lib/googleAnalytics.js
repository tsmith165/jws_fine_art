import { BetaAnalyticsDataClient } from '@google-analytics/data';

const GA_PROPERTY_ID = process.env.GA_PROPERTY_ID;
const GOOGLE_BASE_64_CREDS = process.env.GOOGLE_BASE_64_CREDS;

// Decode the Base64-encoded credentials and parse them into a JSON object
const credentials = JSON.parse(decodeURIComponent(escape(atob(GOOGLE_BASE_64_CREDS))));

const analyticsDataClient = new BetaAnalyticsDataClient({
    credentials: credentials
});

export async function getAnalyticsData(passed_json) {
    const startDate = passed_json['startDate'] !== '' ? passed_json['startDate'] : '30daysAgo';
    const endDate = passed_json['endDate'] !== '' ? passed_json['endDate'] : 'today';
    const metrics = passed_json['metrics'] !== '' ? passed_json['metrics'] : ['sessions', 'eventCount', 'newUsers'];
    const dimensions = passed_json['dimensions'] !== '' ? passed_json['dimensions'] : ['date'];

    console.log(`startDate: ${startDate} | endDate: ${endDate} | metrics: ${metrics} | dimensions: ${dimensions}`);

    const response = await analyticsDataClient.runReport({
        property: `properties/${GA_PROPERTY_ID}`,
        dateRanges: [
            {
                startDate: startDate,
                endDate: endDate,
            },
        ],
        dimensions: dimensions.map((dimension) => ({ name: dimension })),
        metrics: metrics.map((metric) => ({ name: metric })),
    });

    console.log(`Reporting API response: `);
    console.log(JSON.stringify(response));

    return response;
}
