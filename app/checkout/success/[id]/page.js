export const metadata = {
    title: 'JWS Fine Art - Checkout Success',
  description: 'Successful Checkout for JWS Fine Art',
  icons: {
      icon: '/JWS_ICON.png',
  },
}

import PageLayout from '../../components/layout/PageLayout';
import SuccessPage from './success';

export default async function Page(props) {
  return (
    <PageLayout {...props}>
      <SuccessPage/>
    </PageLayout>
  )
}