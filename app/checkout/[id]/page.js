export const metadata = {
  title: 'JWS Fine Art - Checkout',
  description: 'Checkout for JWS Fine Art',
  icons: {
      icon: '/JWS_ICON.png',
  },
}

import PageLayout from '../../components/layout/PageLayout';
import CheckoutPage from './checkout';

export default async function Page(props) {
  return (
    <PageLayout {...props}>
      <CheckoutPage/>
    </PageLayout>
  )
}