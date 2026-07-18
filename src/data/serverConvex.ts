import 'server-only';
import { ConvexHttpClient } from 'convex/browser';

export function getServerConvexClient(): { client: ConvexHttpClient; serverSecret: string } {
    const deploymentUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    const serverSecret = process.env.CONVEX_SERVER_WRITE_SECRET;
    if (!deploymentUrl || !serverSecret) throw new Error('Convex server write configuration is incomplete.');
    return { client: new ConvexHttpClient(deploymentUrl), serverSecret };
}
