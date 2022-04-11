import Head from 'next/head'
import styles from "../../../styles/layout/PageLayout.module.scss"

const PageLayout = (props) => {
    return (
        <div className={styles.container}>
            <Head>
                <title>JWS Fine Art</title>
                <meta name="description" content="JWS Fine Art" />
                <link rel="icon" href="/JWS_ICON.png" />
                <link rel="preconnect" href="https://fonts.gstatic.com"/>
                <link href="https://fonts.googleapis.com/css2?family=Alegreya+Sans+SC:wght@300&family=Lato:wght@300&display=swap" rel="stylesheet"/>

            </Head>
            <main className={styles.main}>
                {props.children}
            </main>
        </div>
    )
}

export default PageLayout;

