import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Script from 'next/script'
import * as gtag from '../lib/gtag'

import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

import Layout from '@/components/layout/Layout'
import '@/styles/globals/globals.scss'

const ADMIN_PAGES = new Set(['/edit/[id]', '/manage', '/admin', '/orders'])

const App = ({ Component, pageProps }) => {
  const router = useRouter()
  const { pathname } = useRouter();
  const isPrivatePath = ADMIN_PAGES.has(pathname)

  console.log(`pathname: ${pathname}`)

  useEffect(() => {
    const handleRouteChange = (url) => {
      console.log(`Sending analytics call with url: ${url}`)
      gtag.pageview(url)
      app_set_state({...app_state, pathname: url, filter_menu_open: false})
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    router.events.on('hashChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
      router.events.off('hashChangeComplete', handleRouteChange)
    }
  }, [router.events])

  const [app_state, app_set_state] = useState({
    pathname: pathname,
    menu_open: false,
    filter_menu_open: false,
    theme: 'None', 
  });

  // console.log(`USING KEY: ${MAPS_JAVASCRIPT_API_KEY}`)
  // console.log(`Using Page Props (Next Line)`)
  // console.log(pageProps)
  
  // console.log(`Rendering APP with app_state URL Path: ${app_state.url_path} | Theme: ${app_state.theme} | Filter Menu Open: ${app_state.filter_menu_open}`)

  return (
    <ClerkProvider appearance={{baseTheme: dark}}>
      <Script 
        strategy="afterInteractive" 
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCvrLDFUzjxCnKIDSuPwBYEbfnWrrIUnu4&libraries=places&callback=Function.prototype"
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
        <Layout most_recent_page_id={pageProps.most_recent_id} app_state={app_state} app_set_state={app_set_state}>
          <Component {...pageProps} app_state={app_state} app_set_state={app_set_state}/>
        </Layout>
      )}
      {isPrivatePath && (
        <>
          <SignedIn>
            <Layout most_recent_page_id={pageProps.most_recent_id} app_state={app_state} app_set_state={app_set_state}>
              <Component {...pageProps} app_state={app_state} app_set_state={app_set_state}/>
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
