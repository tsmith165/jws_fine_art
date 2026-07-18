'use client';

import { LoaderCircle, MailCheck } from 'lucide-react';
import { useState } from 'react';
import { sendTestCheckoutEmail } from './actions';

const initial = { to: '', pieceTitle: '', fullName: '', address: '', pricePaid: 0 };

export default function TestEmail() {
    const [values, setValues] = useState(initial);
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState('');

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSending(true);
        setMessage('');
        const result = await sendTestCheckoutEmail(values);
        setSending(false);
        setMessage(result.success ? 'Test purchase email sent.' : result.error || 'The test email could not be sent.');
    }

    return (
        <form className="owner-tool-form" onSubmit={submit}>
            <label className="owner-field is-wide">
                <span>Recipient email</span>
                <input
                    type="email"
                    required
                    value={values.to}
                    onChange={(event) => setValues((current) => ({ ...current, to: event.target.value }))}
                />
            </label>
            <label className="owner-field">
                <span>Artwork title</span>
                <input
                    required
                    value={values.pieceTitle}
                    onChange={(event) => setValues((current) => ({ ...current, pieceTitle: event.target.value }))}
                />
            </label>
            <label className="owner-field">
                <span>Collector name</span>
                <input
                    required
                    value={values.fullName}
                    onChange={(event) => setValues((current) => ({ ...current, fullName: event.target.value }))}
                />
            </label>
            <label className="owner-field">
                <span>Price paid</span>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={values.pricePaid || ''}
                    onChange={(event) => setValues((current) => ({ ...current, pricePaid: Number(event.target.value) }))}
                />
            </label>
            <label className="owner-field is-wide">
                <span>Shipping address</span>
                <textarea
                    rows={3}
                    required
                    value={values.address}
                    onChange={(event) => setValues((current) => ({ ...current, address: event.target.value }))}
                />
            </label>
            <button className="owner-button" type="submit" disabled={sending}>
                {sending ? <LoaderCircle className="owner-spin" size={16} /> : <MailCheck size={16} />}
                {sending ? 'Sending…' : 'Send test email'}
            </button>
            {message ? (
                <p className="owner-tool-result" role="status">
                    {message}
                </p>
            ) : null}
        </form>
    );
}
