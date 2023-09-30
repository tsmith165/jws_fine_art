export const metadata = {
  title: 'JWS Fine Art - Profile Management',
  description: 'Profile management for JWS Fine Art',
  icons: {
      icon: '/JWS_ICON.png',
  },
}

import PageLayout from '../../components/layout/PageLayout';
import Profile from './profile';

export default async function Page(props) {
  return (
    <PageLayout {...props}>
      <Profile/>
    </PageLayout>
  )
}