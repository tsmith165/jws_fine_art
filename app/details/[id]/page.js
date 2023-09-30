export const metadata = {
  title: 'JWS Fine Art - Gallery Piece Details',
  description: 'View gallery piece details for JWS Fine Art',
  icons: {
      icon: '/JWS_ICON.png',
  },
}

import PageLayout from '@/components/layout/PageLayout';
import Details from './details';

export default async function Page(props) {
  return (
    <PageLayout {...props}>
      <Details/>
    </PageLayout>
  )
}