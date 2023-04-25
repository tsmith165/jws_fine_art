const { google } = require('googleapis');
const fs = require('fs');

const GA_VIEW_ID = process.env.GA_VIEW_ID;
const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;

export default async function (req, res) {
    const passed_json = req.body;

    console.log(`Passed JSON (Next Line):`);
    console.log(passed_json);

    const startDate = passed_json['startDate'] !== '' ? passed_json['startDate'] : '30daysAgo';
    const endDate = passed_json['endDate'] !== '' ? passed_json['endDate'] : 'today';
    const metrics =
        passed_json['metrics'] !== '' ? passed_json['metrics'] : ['ga:sessions', 'ga:pageviews', 'ga:users'];
    const dimensions = passed_json['dimensions'] !== '' ? passed_json['dimensions'] : ['ga:date'];

    console.log(
        `Using Start Date: ${startDate} | End Date: ${endDate} | Dimensions: ${dimensions} | Metrics: ${metrics}`,
    );

    // Read the JSON key file
    const keyFile = JSON.parse(fs.readFileSync(GOOGLE_APPLICATION_CREDENTIALS, 'utf-8'));

    console.log(`Key File (Next Line):`);

    // Initialize Google Analytics Reporting API v4 client
    const client = new google.auth.JWT(keyFile.client_email, null, keyFile.private_key, [
        'https://www.googleapis.com/auth/analytics.readonly',
    ]);

    // Authenticate the client
    await client.authorize();

    // Initialize the API client
    const analyticsReporting = google.analyticsreporting({
        version: 'v4',
        auth: client,
    });

    // Define the request body
    const requestBody = {
        reportRequests: [
            {
                viewId: GA_VIEW_ID,
                dateRanges: [
                    {
                        startDate: startDate,
                        endDate: endDate,
                    },
                ],
                metrics: metrics.map((metric) => ({ expression: metric })),
                dimensions: dimensions.map((dimension) => ({ name: dimension })),
            },
        ],
    };

    console.log(`Request Body (Next Line):`);
    console.log(requestBody);

    // Fetch the analytics data
    const response = await analyticsReporting.reports.batchGet({ requestBody });

    console.log(`Response (Next Line):`);
    console.log(response);

    return response.data.reports[0].data.rows;
}
