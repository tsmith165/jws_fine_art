export const metadata = {
  title: 'JWS Fine Art - Cancel Checkout',
  description: 'Cancel Checkout for JWS Fine Art',
  icons: {
      icon: '/JWS_ICON.png',
  },
}

import PageLayout from '../../components/layout/PageLayout';
import CancelPage from './cancel';

export default async function Page(props) {
  return (
    <PageLayout {...props}>
      <CancelPage/>
    </PageLayout>
  )
}