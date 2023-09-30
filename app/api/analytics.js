import { getAnalyticsData } from '../../lib/googleAnalytics';

export default async function (req, res) {
    const passed_json = req.body;

    console.log(`Passed JSON (Next Line):`);
    console.log(passed_json);

    try {
        const data = await getAnalyticsData(passed_json);
        console.log(`Response (Next Line):`);
        console.log(data);
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching analytics data:', error);
        res.status(500).json({ error: 'Failed to fetch analytics data' });
    }
}
