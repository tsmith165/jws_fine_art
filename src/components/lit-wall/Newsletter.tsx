'use client';

import { ArrowRight } from 'lucide-react';
import { useActionState, useEffect } from 'react';
import { subscribeAction, type PublicFormState } from '@/app/public-actions';
import { captureAnalytics } from '@/lib/analytics';

const initialState: PublicFormState = { status: 'idle', message: '' };

export function Newsletter() {
    const [state, action, pending] = useActionState(subscribeAction, initialState);
    useEffect(() => {
        if (state.status !== 'success' && state.status !== 'error') return;
        captureAnalytics('newsletter_signup_submitted', { result: state.status, source: 'website-footer' });
    }, [state.status]);
    return (
        <section className="lw-newsletter">
            <div>
                <span className="lw-eyebrow">From the studio</span>
                <h2>New work, first look.</h2>
                <p>One thoughtful note each month with paintings, process, and studio news.</p>
            </div>
            <form action={action}>
                <input type="hidden" name="source" value="website-footer" />
                <label className="lw-honeypot" aria-hidden="true">
                    Website
                    <input name="website" type="text" tabIndex={-1} autoComplete="off" />
                </label>
                <label>
                    <span>Email address</span>
                    <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
                </label>
                <button className="lw-button lw-button-brass" disabled={pending}>
                    {pending ? 'Joining…' : 'Join the list'} <ArrowRight size={16} />
                </button>
                <p className={`lw-form-message is-${state.status}`} aria-live="polite">
                    {state.message}
                </p>
            </form>
        </section>
    );
}
