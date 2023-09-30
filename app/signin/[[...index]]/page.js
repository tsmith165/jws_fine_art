export const metadata = {
  title: 'JWS Fine Art - Sign In',
  description: 'Sign In to JWS Fine Art',
  icons: {
      icon: '/JWS_ICON.png',
  },
}

import PageLayout from '../../components/layout/PageLayout';
import SignInPage from './sign_in';

export default async function Page(props) {
  return (
    <PageLayout {...props}>
      <SignInPage/>
    </PageLayout>
  )
}