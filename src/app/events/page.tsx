import { permanentRedirect } from 'next/navigation';

export default function LegacyEventsRedirect() {
    permanentRedirect('/studio');
}
