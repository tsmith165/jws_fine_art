export const metadata = {
  title: 'JWS Fine Art - Sign In',
  description: 'Sign In to JWS Fine Art',
  icons: {
      icon: '/JWS_ICON.png',
  },
}

import PageLayout from '@/components/layout/PageLayout';
import Sign_In from '@/app/signin/Sign_In';

export default async function Page(props) {
  return (
    <PageLayout {...props}>
      <Sign_In/>
    </PageLayout>
  )
}