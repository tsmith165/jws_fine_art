import { permanentRedirect } from 'next/navigation';

export default function LegacyFaqRedirect() {
    permanentRedirect('/contact#collector-guide');
}
