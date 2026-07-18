import { redirect } from 'next/navigation';

export default function LegacyManageRedirect() {
    redirect('/admin/artwork');
}
