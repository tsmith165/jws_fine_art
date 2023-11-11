export const metadata = {
  title: 'JWS Fine Art - Socials Page',
  description: 'Socials page for JWS Fine Art',
  icons: {
      icon: '/JWS_ICON.png',
  },
}

import PageLayout from '@/components/layout/PageLayout';
import Socials from '@/app/socials/Socials';

export default async function Page(props) {
  return (
    <PageLayout {...props}>
      <Socials/>
    </PageLayout>
  )
}