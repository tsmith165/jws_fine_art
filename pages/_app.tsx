import React from 'react';
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Script from 'next/script'
import * as gtag from '../lib/gtag'
import { AppProps } from 'next/app';
import { dark } from '@clerk/themes';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';

const MAPS_JAVASCRIPT_API_KEY = process.env.MAPS_JAVASCRIPT_API_KEY
import '../styles/globals/globals.scss'
import Layout from '../src/components/layout/Layout'

const ADMIN_PAGES = new Set(['/edit/[id]', '/manage', '/admin', '/orders'])

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter()
  const { pathname } = useRouter();
  const isPrivatePath = ADMIN_PAGES.has(pathname)
  console.log(`Pathname ${pathname} is private?: ${isPrivatePath}`)

  useEffect(() => {
    const handleRouteChange = (url) => {
      console.log(`Sending analytics call with url: ${url}`)
      gtag.pageview(url)
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    router.events.on('hashChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
      router.events.off('hashChangeComplete', handleRouteChange)
    }
  }, [router.events])

  console.log(`USING KEY: ${MAPS_JAVASCRIPT_API_KEY}`)

  return (
    <ClerkProvider appearance={{baseTheme: dark}}>
      <Script 
        strategy="afterInteractive" 
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCvrLDFUzjxCnKIDSuPwBYEbfnWrrIUnu4&libraries=places"
      />
      <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gtag.GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      {!isPrivatePath && (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
      {isPrivatePath && (
        <>
          <SignedIn>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </SignedIn>
          <SignedOut>
            <RedirectToSignIn/>
          </SignedOut>
        </>
      )}

    </ClerkProvider>
  );
}

export default App;
