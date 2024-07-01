import React from 'react';
import { Html, Head, Preview, Body, Container, Section, Heading, Text, Tailwind } from '@react-email/components';

interface CheckoutSuccessEmailProps {
    piece_title: string;
    full_name: string;
    address: string;
    price_paid: number;
}

const CheckoutSuccessEmail: React.FC<CheckoutSuccessEmailProps> = ({ piece_title, full_name, address, price_paid }) => {
    return (
        <Html>
            <Head />
            <Preview>Purchase Confirmation - JWS Fine Art Gallery</Preview>
            <Tailwind
                config={{
                    theme: {
                        extend: {
                            colors: {
                                primary: '#54786d',
                                primary_dark: '#365349',
                                secondary_light: '#616c63',
                                secondary: '#475451',
                                secondary_dark: '#333739',
                            },
                        },
                    },
                }}
            >
                <Body className="h-full w-full">
                    <Container className="h-full w-full rounded-lg bg-stone-900 p-2">
                        <Heading className="h-fit w-full p-4 pb-0 text-center text-2xl font-bold text-primary">
                            JWS Fine Art Purchase Confirmation
                        </Heading>
                        <Section className="flex-col space-y-0.5 px-4">
                            <Text className="text-lg">Dear {full_name},</Text>
                            <Text className="text-lg">
                                Thank you for your purchase of "{piece_title}". Your transaction of ${price_paid.toFixed(2)} has been
                                successfully processed.
                            </Text>
                            <Text className="text-lg">We appreciate your support and hope you enjoy your new artwork!</Text>
                            <Text className="text-lg">
                                Your piece will be shipped to you within 5 business days. If you have any questions or concerns, please
                                don't hesitate to contact us.
                            </Text>
                            <Text className="text-lg">We will be shipping to:</Text>
                            <Text className="text-lg">
                                {full_name}
                                <br />
                                {address}
                            </Text>
                            <Text className="text-lg">If you have any questions or concerns, please don't hesitate to contact us.</Text>
                            <Text className="text-lg">Have a great day!</Text>
                            <Text className="text-lg">Jill Weeks Smith</Text>
                            <Text className="text-lg">
                                <a href="https://www.jwsfineart.com" className="text-blue-400 hover:text-blue-300">
                                    jwsfineart@gmail.com
                                </a>
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default CheckoutSuccessEmail;
