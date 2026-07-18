import 'server-only';
import { ConvexHttpClient } from 'convex/browser';

let client: ConvexHttpClient | undefined;

export function getConvexClient(): ConvexHttpClient {
    const deploymentUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!deploymentUrl) {
        throw new Error('NEXT_PUBLIC_CONVEX_URL is required.');
    }
    client ??= new ConvexHttpClient(deploymentUrl);
    return client;
}
