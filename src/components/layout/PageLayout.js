import PROJECT_CONSTANTS from '@/lib/constants';

import Head from 'next/head';
import styles from '@/styles/layout/PageLayout.module.scss';

const PageLayout = ({ page_title = PROJECT_CONSTANTS.SITE_FULL_NAME, children }) => {
    console.log(`Loading Page Layout With Title: ${page_title}`);

    return (
        <div className={styles.container}>
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
