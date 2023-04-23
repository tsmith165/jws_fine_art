import PROJECT_CONSTANTS from '@/lib/constants';

import Head from 'next/head';
import Script from 'next/script';
import styles from '@/styles/layout/PageLayout.module.scss';

const handleScriptLoad = () => {
    console.log('Google Maps JavaScript API has been loaded.');
};

const PageLayout = ({ page_title = PROJECT_CONSTANTS.SITE_FULL_NAME, use_maps_api = false, children }) => {
    console.log(`Loading Page Layout With Title: ${page_title}`);

    return (
        <div className={styles.container}>
            {use_maps_api == true ? (
                <Script
                    strategy="beforeInteractive"
                    src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyCvrLDFUzjxCnKIDSuPwBYEbfnWrrIUnu4&libraries=places&callback=handleScriptLoad`}
                    onLoad={handleScriptLoad}
                />
            ) : null}

            <Head>
                <meta charSet="UTF-8" />
                <meta name="description" content={PROJECT_CONSTANTS.SITE_DESCRIPTION} />
                <title>{page_title}</title>
                <link rel="icon" href="/JWS_ICON.png" />
            </Head>

            <main className={styles.main}>{children}</main>
        </div>
    );
};

export default PageLayout;
