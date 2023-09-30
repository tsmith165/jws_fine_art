export const metadata = {
  title: 'JWS Fine Art - Edit Piece Details',
  description: 'Edit gallery piece details for JWS Fine Art',
  icons: {
      icon: '/JWS_ICON.png',
  },
}

import PageLayout from '../../components/layout/PageLayout';
import Edit from './edit';

export default async function Page(props) {
  return (
    <PageLayout {...props}>
      <Edit/>
    </PageLayout>
  )
}