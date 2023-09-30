export const metadata = {
  title: 'JWS Fine Art - Contact',
  description: 'Jill Weeks Smith Contact',
  icons: {
      icon: '/JWS_ICON.png',
  },
}

import PageLayout from '../../components/layout/PageLayout';
import ContactPage from './contact';

export default async function Page(props) {
  return (
    <PageLayout {...props}>
      <ContactPage/>
    </PageLayout>
  )
}