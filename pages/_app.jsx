import logger from "@/lib/logger";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Script from 'next/script';
import * as gtag from '../lib/gtag';

import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

import Layout from '@/components/layout/Layout';
import '@/styles/globals/globals.scss';

import 'typeface-lato';

const ADMIN_PAGES = new Set(['/edit/[id]', '/manage', '/admin', '/orders']);

const App = ({ Component, pageProps }) => {
    const router = useRouter();
    const { pathname } = useRouter();
    const isPrivatePath = ADMIN_PAGES.has(pathname);

    logger.debug(`pathname: ${pathname}`);

    useEffect(() => {
        const handleRouteChange = (url) => {
            logger.debug(`Sending analytics call with url: ${url}`);
            gtag.pageview(url);
            app_set_state({ ...app_state, pathname: url, filter_menu_open: false });
        };
        router.events.on('routeChangeComplete', handleRouteChange);
        router.events.on('hashChangeComplete', handleRouteChange);
        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
            router.events.off('hashChangeComplete', handleRouteChange);
        };
    }, [router.events]);

    useEffect(() => {
        const tawkToInterval = setInterval(() => {
            if (window.Tawk_API) {
                clearInterval(tawkToInterval);
                window.Tawk_API.onLoad = function() {
                    window.Tawk_API.customStyle = {
                        visibility: {
                            desktop: {
                                xOffset: '20px', // Adjust to your preference
                                yOffset: '20px', // Adjust to your preference
                                position: 'bl',  // Adjust to your preference
                            },
                            mobile: {
                                xOffset: '20px', // Adjust to your preference
                                yOffset: '20px', // Adjust to your preference
                                position: 'bl',  // Adjust to your preference
                            },
                            bubble: {
                                xOffset: '20px', // Adjust to your preference
                                yOffset: '20px', // Adjust to your preference
                                rotate: 0,       // Adjust to your preference
                            },
                        },
                    };
                };
            }
        }, 500);
    }, []);

    const [app_state, app_set_state] = useState({
        pathname: pathname,
        menu_open: false,
        filter_menu_open: false,
        theme: 'None',
    });

    return (
        <ClerkProvider appearance={{ baseTheme: dark }}>
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
            />
            <Script
                id="gtag-init"
                strategy="afterInteractive"
            >
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${gtag.GA_TRACKING_ID}', {
                        page_path: window.location.pathname,
                    });
                `}
            </Script>
            <Script
                strategy="beforeInteractive"
                src="https://embed.tawk.to/6465199bad80445890ed8909/1h0leo2ac"
            />
            {!isPrivatePath && (
                <Layout
                    most_recent_page_id={pageProps.most_recent_id}
                    app_state={app_state}
                    app_set_state={app_set_state}
                >
                    <Component {...pageProps} app_state={app_state} app_set_state={app_set_state} />
                </Layout>
            )}
            {isPrivatePath && (
                <>
                    <SignedIn>
                        <Layout
                            most_recent_page_id={pageProps.most_recent_id}
                            app_state={app_state}
                            app_set_state={app_set_state}
                        >
                            <Component {...pageProps} app_state={app_state} app_set_state={app_set_state} />
                        </Layout>
                    </SignedIn>
                    <SignedOut>
                        <RedirectToSignIn />
                    </SignedOut>
                </>
            )}
        </ClerkProvider>
    );
};

export default App;
