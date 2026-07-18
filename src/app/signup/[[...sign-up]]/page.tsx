import { redirect } from 'next/navigation';

export default function OwnerSignupRedirect() {
    redirect('/signin');
}
