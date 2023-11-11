// components/components/ScriptLoader.js
import Script from 'next/script';
import * as gtag from '@/lib/gtag';

function ScriptLoader() {
    return (
        <>
            <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`} />
            <Script id="gtag-init" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gtag.GA_TRACKING_ID}', {
                    page_path: window.location.pathname,
                });
            ` }} />
            <Script strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `
                var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
                (function(){
                    var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                    s1.async=true;
                    s1.src='https://embed.tawk.to/6465199bad80445890ed8909/1h0leo2ac';
                    s1.charset='UTF-8';
                    s1.setAttribute('crossorigin','*');
                    s0.parentNode.insertBefore(s1,s0);
                })();
            ` }} />
        </>
    );
}

export default ScriptLoader;