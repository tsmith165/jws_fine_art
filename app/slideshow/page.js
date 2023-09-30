export const metadata = {
  title: 'JWS Fine Art - Gallery Slideshow',
  description: 'Gallery slideshow for JWS Fine Art',
  icons: {
      icon: '/JWS_ICON.png',
  },
}

import PageLayout from '../../components/layout/PageLayout';
import SlideshowPage from './slideshow';

export default async function Page(props) {
  return (
    <PageLayout {...props}>
      <SlideshowPage/>
    </PageLayout>
  )
}