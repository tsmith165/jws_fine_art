'use client';

import React, { useState, useEffect } from 'react';
// APIs
import { loadStripe } from '@stripe/stripe-js';
import { useLoadScript, Libraries } from '@react-google-maps/api';
// Icons
import { TbProgress } from 'react-icons/tb';
// Server Actions
import { runStripePurchase } from '../actions';
// Components
import InputTextbox from '@/components/inputs/InputTextbox';
import InputAutoComplete from '@/components/inputs/InputAutoComplete';
import StripeBrandedButton from '@/components/svg/StripeBrandedButton';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);
const INTERNATIONAL_SHIPPING_RATE = 25;
const googleMapsLibraries: Libraries = ['places'];

interface CheckoutFormProps {
    current_piece: any;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ current_piece }) => {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        libraries: googleMapsLibraries,
    });

    const [loading, setLoading] = React.useState(false);
    const [submitted, setSubmitted] = React.useState(false);
    const [errorFound, setErrorFound] = React.useState(false);
    const [address, setAddress] = React.useState('');
    const [isInternational, setIsInternational] = useState(false);

    // CHECK THAT GOOGLE MAPS API IS LOADED
    if (loadError) {
        return <div>Error loading Google Maps API: {loadError.message}</div>;
    }

    const handleStripePurchaseClick = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setSubmitted(false);
        setErrorFound(false);

        const formData = new FormData(event.currentTarget);
        const response = await runStripePurchase(formData);

        if (response && response.success && response.redirectUrl) {
            window.location.href = response.redirectUrl;
        } else {
            console.error('Stripe purchase failed');
            setLoading(false);
            setSubmitted(false);
            setErrorFound(true);
        }
    };

    const handleAddressChange = (value: string) => {
        setAddress(value);
        const isInternationalAddress = value.includes('USA') ? false : true;
        console.log(`Address changed to: ${value}`);
        console.log(`Address is international: ${isInternationalAddress}`);
        setIsInternational(isInternationalAddress);
    };

    useEffect(() => {
        // Set the initial value of isInternational based on the current_piece prop
        setIsInternational(current_piece.international);
    }, [current_piece.international]);

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
            <form onSubmit={handleStripePurchaseClick} className="flex flex-col">
                <input type="hidden" name="piece_id" value={current_piece.id} />

                <div className="flex flex-col space-y-2">
                    <InputTextbox name="full_name" placeholder="Enter Full Name..." />
                    <InputTextbox name="phone" placeholder="Enter Phone Number..." />
                    <InputTextbox name="email" placeholder="Enter Email Address..." />
                    {isLoaded ? (
                        <InputAutoComplete name="address" value={address} onChange={handleAddressChange} />
                    ) : (
                        <InputTextbox name="address" placeholder="Enter Address..." />
                    )}
                </div>

                <div className="mt-4">
                    <StripeBrandedButton
                        url={'submit'}
                        price={isInternational ? current_piece.price + INTERNATIONAL_SHIPPING_RATE : current_piece.price}
                        text="purchase"
                    />
                    <div className="mt-2">
                        <div className="font-sans text-stone-300">
                            {`Pieces ship within 5 days. ${isInternational ? 'International shipping costs $25 and can take up to 1 month.' : 'Domestic shipping can take up to a week.'}`}
                        </div>
                    </div>
                </div>

                {submit_container}
            </form>
        </div>
    );
};

export default CheckoutForm;
