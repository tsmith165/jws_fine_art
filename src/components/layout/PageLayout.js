import Head from 'next/head'
import Script from 'next/script'
import styles from "../../../styles/layout/PageLayout.module.scss"

const PageLayout = ({page_title="JWS Fine Art", use_maps_api=false, children}) => {
    console.log(`-------------------------------------------------------`)
    console.log(`Page Title: ${page_title}`)
    // console.log('Children (NEXT LINE):')
    // console.log(children)

    return (
        <div className={styles.container}>
            {
                (use_maps_api == true) ? (
                    <Script 
                        strategy="beforeInteractive" 
                        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCvrLDFUzjxCnKIDSuPwBYEbfnWrrIUnu4&libraries=places"
                    />
                ) : (
                    null
                )
            }

            <Head>
                <meta charset="UTF-8"/>
                <meta name="description" content="JWS Fine Art Gallery - Browse and Purchase online!" />
                <title>{page_title}</title>
                <link rel="icon" href="/JWS_ICON.png" />
            </Head>
            
            <main className={styles.main}>
                {children}
            </main>
        </div>
    )
}

export default PageLayout;

