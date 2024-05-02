export const metadata = {
    title: 'JWS Fine Art - Profile Management',
    description: 'Profile management for JWS Fine Art',
    icons: {
        icon: '/JWS_ICON.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Profile Management',
    },
};

import PageLayout from '@/components/layout/PageLayout';
import Profile from '@/app/profile/profile';

export default async function Page(props) {
    return (
        <PageLayout page="/profile">
            <Profile />
        </PageLayout>
    );
}
