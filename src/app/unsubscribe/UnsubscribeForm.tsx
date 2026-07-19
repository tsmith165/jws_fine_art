'use client';

import { useState, useTransition } from 'react';
import { confirmUnsubscribe } from './actions';

export function UnsubscribeForm({ token, email }: { token: string; email: string }) {
    const [result, setResult] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();
    return (
        <div>
            <p>Stop studio notes and new-work announcements for {email}.</p>
            {result ? <p role="status">{result}</p> : null}
            <button
                className="lw-button lw-button-brass"
                type="button"
                disabled={pending || Boolean(result)}
                onClick={() => startTransition(async () => setResult((await confirmUnsubscribe(token)).message))}
            >
                {pending ? 'Updating…' : 'Unsubscribe'}
            </button>
        </div>
    );
}
