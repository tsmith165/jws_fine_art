export const metadata = {
  title: 'JWS Fine Art - Admin',
  description: 'Display admin info for authenticated users',
  icons: {
      icon: '/JWS_ICON.png',
  },
}

import PageLayout from '@/components/layout/PageLayout';
import Admin from '@/components/pages/admin/admin';

export default async function Page(props) {
  return (
    <PageLayout {...props}>
      <Admin/>
    </PageLayout>
  )
}