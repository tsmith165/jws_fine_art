export const metadata = {
  title: 'JWS Fine Art - Sign Up',
  description: 'Sign up to JWS Fine Art',
  icons: {
      icon: '/JWS_ICON.png',
  },
}

import PageLayout from '@/components/layout/PageLayout';
import Sign_Up from '@/components/pages/signup/Sign_Up';

export default async function Page(props) {
  return (
    <PageLayout {...props}>
      <Sign_Up/>
    </PageLayout>
  )
}