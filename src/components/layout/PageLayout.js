import Head from 'next/head'
import styles from "../../../styles/PageLayout.module.scss"

const PageLayout = (props) => {
    return (
        <div className={styles.container}>
            <Head>
                <title>Generic Auth</title>
                <meta name="description" content="Generic Auth" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                {props.children}
            </main>
        </div>
    )
}

export default PageLayout;

