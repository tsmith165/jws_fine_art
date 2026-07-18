import { permanentRedirect } from 'next/navigation';

export default function LegacyArtworkIndexRedirect() {
    permanentRedirect('/work');
}
