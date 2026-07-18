'use client';

import { Send } from 'lucide-react';
import { useActionState } from 'react';
import { inquiryAction, type PublicFormState } from '@/app/public-actions';

const initialState: PublicFormState = { status: 'idle', message: '' };

export function InquiryForm({
    artworkId,
    artworkTitle,
    kind = 'general',
    sourcePath = '/contact',
}: {
    artworkId?: number;
    artworkTitle?: string;
    kind?: 'artwork' | 'commission' | 'general';
    sourcePath?: string;
}) {
    const [state, action, pending] = useActionState(inquiryAction, initialState);
    return (
        <form className="lw-inquiry-form" action={action}>
            <input type="hidden" name="artwork_id" value={artworkId || ''} />
            <input type="hidden" name="source_path" value={sourcePath} />
            <label className="lw-honeypot" aria-hidden="true">
                Website
                <input name="website" type="text" tabIndex={-1} autoComplete="off" />
            </label>
            <fieldset>
                <legend>What can Jill help with?</legend>
                <div>
                    {[
                        ['artwork', 'An artwork'],
                        ['commission', 'A commission'],
                        ['general', 'Studio or press'],
                    ].map(([value, label]) => (
                        <label key={value}>
                            <input type="radio" name="kind" value={value} defaultChecked={value === kind} />
                            <span>{label}</span>
                        </label>
                    ))}
                </div>
            </fieldset>
            <div className="lw-field-row">
                <label>
                    Name
                    <input name="name" required autoComplete="name" placeholder="Your name" />
                </label>
                <label>
                    Email
                    <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
                </label>
            </div>
            <label>
                Phone <small>Optional</small>
                <input name="phone" type="tel" autoComplete="tel" />
            </label>
            {artworkTitle && (
                <p className="lw-selected-artwork">
                    About: <strong>{artworkTitle}</strong>
                </p>
            )}
            <label>
                Message
                <textarea
                    name="message"
                    required
                    minLength={10}
                    maxLength={5000}
                    rows={6}
                    placeholder="Tell Jill what you would like to know…"
                />
            </label>
            <button className="lw-button lw-button-brass" disabled={pending}>
                <Send size={16} /> {pending ? 'Sending…' : 'Send inquiry'}
            </button>
            <p className={`lw-form-message is-${state.status}`} aria-live="polite">
                {state.message}
            </p>
        </form>
    );
}
