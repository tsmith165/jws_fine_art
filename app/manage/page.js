export const metadata = {
  title: 'JWS Fine Art - Admin Management',
  description: 'Jill Weeks Smith Admin Management',
  icons: {
      icon: '/JWS_ICON.png',
  },
}

import PageLayout from '../../components/layout/PageLayout';
import Manage from './manage';

export default async function Page(props) {
  return (
    <PageLayout {...props}>
      <Manage/>
    </PageLayout>
  )
}