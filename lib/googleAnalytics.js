// lib/googleAnalytics.js
import { google } from 'googleapis';

const { GOOGLE_APPLICATION_CREDENTIALS: credentials, GA_VIEW_ID: viewId } = process.env;

const getGoogleAnalyticsData = async (startDate, endDate, metrics, dimensions) => {
    if (!credentials || !viewId) {
        throw new Error('Google Analytics credentials or view ID missing.');
    }

    const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(credentials),
        scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });

    const client = await auth.getClient();

    const analyticsreporting = google.analyticsreporting({ version: 'v4', auth: client });

    const { data } = await analyticsreporting.reports.batchGet({
        requestBody: {
            reportRequests: [
                {
                    viewId,
                    dateRanges: [
                        {
                            startDate,
                            endDate,
                        },
                    ],
                    metrics: metrics.map((metric) => ({ expression: metric })),
                    dimensions: dimensions.map((dimension) => ({ name: dimension })),
                },
            ],
        },
    });

    return data;
};

export default getGoogleAnalyticsData;
