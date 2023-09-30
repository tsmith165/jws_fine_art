export const metadata = {
  title: 'JWS Fine Art - Sign Up',
  description: 'Sign up to JWS Fine Art',
  icons: {
      icon: '/JWS_ICON.png',
  },
}

import PageLayout from '@/components/layout/PageLayout';
import SignUpPage from './sign_up';

export default async function Page(props) {
  return (
    <PageLayout {...props}>
      <SignUpPage/>
    </PageLayout>
  )
}