const productionHosts = new Set(['jwsfineart.com', 'www.jwsfineart.com']);

const excludedPathPrefixes = [
    '/admin',
    '/login',
    '/logout',
    '/sign-in',
    '/sign-out',
    '/signin',
    '/signout',
];

export function isPublicAnalyticsPath(pathname: string) {
    return !excludedPathPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function shouldCaptureAnalytics(url: Pick<URL, 'hostname' | 'pathname'>, capturePreviews = false) {
    const isProductionHost = productionHosts.has(url.hostname.toLowerCase());
    return (isProductionHost || capturePreviews) && isPublicAnalyticsPath(url.pathname);
}

export function sanitizedAnalyticsUrl(url: Pick<URL, 'origin' | 'pathname'>) {
    return `${url.origin}${url.pathname}`;
}

export function sanitizePostHogProperties<T extends Record<string, unknown>>(properties: T): T {
    return Object.fromEntries(
        Object.entries(properties).map(([key, value]) => {
            if (typeof value !== 'string' || !/^https?:\/\//i.test(value)) return [key, value];
            try {
                const url = new URL(value);
                return [key, sanitizedAnalyticsUrl(url)];
            } catch {
                return [key, value];
            }
        }),
    ) as T;
}

export function normalizedAnalyticsPath(value: unknown) {
    if (typeof value !== 'string' || !value) return '/unknown';

    let pathname = value;
    try {
        pathname = new URL(value, 'https://jwsfineart.com').pathname;
    } catch {
        pathname = value.split('?')[0] || '/unknown';
    }

    if (pathname === '/gallery' || pathname === '/slideshow') return '/work';
    if (pathname === '/biography') return '/studio';
    if (pathname.startsWith('/details/')) return '/work/[artwork]';
    if (pathname.startsWith('/work/')) return '/work/[artwork]';
    if (pathname.startsWith('/checkout/')) return '/checkout';
    return pathname || '/';
}

export function analyticsPathLabel(pathname: string) {
    const labels: Record<string, string> = {
        '/': 'Home',
        '/work': 'Work',
        '/work/[artwork]': 'Artwork detail',
        '/studio': 'Studio & story',
        '/commissions': 'Commissions',
        '/contact': 'Contact',
        '/checkout': 'Checkout',
        '/unsubscribe': 'Unsubscribe',
    };
    return labels[pathname] ?? pathname;
}
