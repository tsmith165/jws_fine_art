import Head from 'next/head'
import styles from "../../../styles/PageLayout.module.scss"

const PageLayout = (props) => {
    return (
        <div className={styles.container}>
            <Head>
                <title>JWS Fine Art</title>
                <meta name="description" content="JWS Fine Art" />
                <link rel="icon" href="/JWS_ICON.png" />
            </Head>

            <main className={styles.main}>
                {props.children}
            </main>
        </div>
    )
}

export default PageLayout;

