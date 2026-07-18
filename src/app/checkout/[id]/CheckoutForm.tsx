'use client';

import { CreditCard, LoaderCircle, LockKeyhole } from 'lucide-react';
import { useState } from 'react';
import type { PiecesWithImages } from '@/db/schema';
import { money } from '@/lib/artwork';
import { runStripePurchase } from '../actions';

export default function CheckoutForm({ current_piece }: { current_piece: PiecesWithImages }) {
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setPending(true);
        setError('');
        try {
            const result = await runStripePurchase(new FormData(event.currentTarget));
            if (!result.redirectUrl) throw new Error('Checkout URL is missing.');
            window.location.assign(result.redirectUrl);
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : 'Checkout could not be started.');
            setPending(false);
        }
    }

    return (
        <form className="lw-checkout-form" onSubmit={submit}>
            <input type="hidden" name="piece_id" value={current_piece.id} />
            <div className="lw-field-row">
                <label>
                    Full name
                    <input name="full_name" required autoComplete="name" />
                </label>
                <label>
                    Email
                    <input name="email" type="email" required autoComplete="email" />
                </label>
            </div>
            <label>
                Phone
                <input name="phone" type="tel" required autoComplete="tel" />
            </label>
            <label>
                Shipping address
                <textarea
                    name="address"
                    required
                    autoComplete="street-address"
                    rows={4}
                    placeholder="Street, city, region, postal code, and country"
                />
            </label>
            <div className="lw-checkout-total">
                <span>Artwork</span>
                <strong>{money(current_piece.price)}</strong>
                <small>
                    International shipping, when applicable, is calculated as a separate $25 line item after the address is submitted.
                </small>
            </div>
            <button className="lw-button lw-button-brass lw-wide-button" disabled={pending}>
                {pending ? <LoaderCircle className="lw-spin" size={17} /> : <CreditCard size={17} />}{' '}
                {pending ? 'Opening secure checkout…' : `Continue to secure payment · ${money(current_piece.price)}`}
            </button>
            <p className="lw-secure-note">
                <LockKeyhole size={14} /> Payment is completed on Stripe. Card details never touch this site.
            </p>
            {error && (
                <p className="lw-form-message is-error" role="alert">
                    {error}
                </p>
            )}
        </form>
    );
}
