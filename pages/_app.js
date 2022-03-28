import '../styles/globals.scss'
import Layout from '../src/components/layout/Layout'
import { Provider } from "next-auth/react"

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Provider session={pageProps.session}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </Provider>
    </>
  )
}

export default MyApp
