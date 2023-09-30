export const metadata = {
  title: 'JWS Fine Art - Order Management',
  description: 'Order management for JWS Fine Art',
  icons: {
      icon: '/JWS_ICON.png',
  },
}

import PageLayout from '../../components/layout/PageLayout';
import Orders from './orders';

export default async function Page(props) {
  return (
    <PageLayout {...props}>
      <Orders/>
    </PageLayout>
  )
}