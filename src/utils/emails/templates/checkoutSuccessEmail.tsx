import React from 'react';

interface CheckoutSuccessEmailProps {
    piece_title: string;
    full_name: string;
    address: string;
    price_paid: number;
}

const bodyStyle: React.CSSProperties = {
    margin: 0,
    width: '100%',
    backgroundColor: '#1c1917',
    color: '#f5f5f4',
    fontFamily: 'Arial, Helvetica, sans-serif',
};

const previewStyle: React.CSSProperties = {
    display: 'none',
    maxHeight: 0,
    overflow: 'hidden',
    opacity: 0,
};

const containerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '640px',
    margin: '0 auto',
    borderRadius: '8px',
    backgroundColor: '#1c1917',
    padding: '8px',
};

const headingStyle: React.CSSProperties = {
    margin: '0',
    padding: '16px 16px 0',
    color: '#54786d',
    fontSize: '24px',
    fontWeight: 700,
    textAlign: 'center',
};

const sectionStyle: React.CSSProperties = {
    padding: '0 16px 16px',
};

const textStyle: React.CSSProperties = {
    color: '#f5f5f4',
    fontSize: '18px',
    lineHeight: '28px',
    margin: '12px 0',
};

const linkStyle: React.CSSProperties = {
    color: '#60a5fa',
};

const CheckoutSuccessEmail: React.FC<CheckoutSuccessEmailProps> = ({ piece_title, full_name, address, price_paid }) => {
    return (
        <html>
            <body style={bodyStyle}>
                <div style={previewStyle}>Purchase Confirmation - JWS Fine Art Gallery</div>
                <main style={containerStyle}>
                    <h1 style={headingStyle}>JWS Fine Art Purchase Confirmation</h1>
                    <section style={sectionStyle}>
                        <p style={textStyle}>Dear {full_name},</p>
                        <p style={textStyle}>
                            Thank you for your purchase of &quot;{piece_title}&quot;. Your transaction of ${price_paid.toFixed(2)} has been
                            successfully processed. Sales tax is included in this amount.
                        </p>
                        <p style={textStyle}>We appreciate your support and hope you enjoy your new artwork!</p>
                        <p style={textStyle}>
                            Your piece will be shipped to you within 5 business days. If you have any questions or concerns, please
                            don&apos;t hesitate to contact us.
                        </p>
                        <p style={textStyle}>We will be shipping to:</p>
                        <p style={textStyle}>
                            {full_name}
                            <br />
                            {address}
                        </p>
                        <p style={textStyle}>If you have any questions or concerns, please don&apos;t hesitate to contact us.</p>
                        <p style={textStyle}>Have a great day!</p>
                        <p style={textStyle}>Jill Weeks Smith</p>
                        <p style={textStyle}>
                            <a href="https://www.jwsfineart.com" style={linkStyle}>
                                jwsfineart@gmail.com
                            </a>
                        </p>
                    </section>
                </main>
            </body>
        </html>
    );
};

export default CheckoutSuccessEmail;
