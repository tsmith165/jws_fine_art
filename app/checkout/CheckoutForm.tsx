'use client';

import React from 'react';
import Image from 'next/image';
// APIs
import { loadStripe } from '@stripe/stripe-js';
import { useLoadScript } from '@react-google-maps/api';
// Icons
import { TbProgress } from 'react-icons/tb';
// Server Actions
import { onSubmit } from './actions';
// Components
import InputTextbox from '@/components/inputs/InputTextbox';
import InputAutoComplete from '@/components/inputs/InputAutoComplete';
import StripeBrandedButton from '@/components/svg/StripeBrandedButton';

const stripePromise = loadStripe(
    'pk_live_51IxP3oAuEqsFZjntawC5wWgSCTRmnkkxJhlICQmU8xH03qoS7mp2Dy7DHvKMb8uwPwxkf4sVuER5dqaLESIV3Urm00f0Hs2jsj',
);
const INTERNATIONAL_SHIPPING_RATE = 25;

interface CheckoutFormProps {
    current_piece: any;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ current_piece }) => {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: 'AIzaSyAQTCNGxtlglxAOC-CjqhKc2nroYKmPS7s',
        libraries: ['places'],
    });

    const [loading, setLoading] = React.useState(false);
    const [submitted, setSubmitted] = React.useState(false);
    const [errorFound, setErrorFound] = React.useState(false);

    // CHECK THAT GOOGLE MAPS API IS LOADED
    if (loadError) {
        return <div>Error loading Google Maps API: {loadError.message}</div>;
    }
    if (!isLoaded) {
        return <div>Loading Google Maps API...</div>;
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setSubmitted(false);
        setErrorFound(false);

        const formData = new FormData(event.currentTarget);
        const response = await onSubmit(formData);

        if (response && response.success && response.redirectUrl) {
            window.location.href = response.redirectUrl;
        } else {
            // Handle error case
            console.error('Checkout submission failed');
            setLoading(false);
            setSubmitted(false);
            setErrorFound(true);
        }
    };

    const price_with_shipping = current_piece.price + (current_piece.international ? INTERNATIONAL_SHIPPING_RATE : 0);

    const submit_loader_spinner = <TbProgress className="animate-spin text-primary" />;
    const submit_successful_jsx = <div className="text-green-500">Checkout submit successful.</div>;
    const submit_unsuccessful_jsx = <div className="text-red-500">Checkout submit was not successful.</div>;

    const loader_container = loading
        ? submit_loader_spinner
        : submitted
          ? submit_successful_jsx
          : errorFound
            ? submit_unsuccessful_jsx
            : null;

    const submit_container = loader_container && <div className="mt-4">{loader_container}</div>;

    return (
        <div className="flex h-full w-full flex-col overflow-y-auto">
            <form onSubmit={handleSubmit} className="flex flex-col p-4">
                <input type="hidden" name="piece_id" value={current_piece.id} />

                <div className="flex flex-col space-y-2">
                    <InputTextbox name="full_name" placeholder="Enter Full Name..." />
                    <InputTextbox name="phone" placeholder="Enter Phone Number..." />
                    <InputTextbox name="email" placeholder="Enter Email Address..." />
                    <InputAutoComplete name="address" />
                </div>

                <div className="mt-4">
                    <StripeBrandedButton url={'submit'} price={price_with_shipping} text="Purchase" />
                    <div className="mt-2">
                        <div className="text-secondary_dark">
                            {`Pieces ship within 5 days. ${
                                current_piece.international
                                    ? 'International shipping costs $25 and can take up to 1 month.'
                                    : 'Domestic shipping can take up to a week.'
                            }`}
                        </div>
                    </div>
                </div>

                {submit_container}
            </form>
        </div>
    );
};

export default CheckoutForm;
